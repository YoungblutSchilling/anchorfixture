import type {
  AccountFixture,
  AnchorIdl,
  AnchorIdlAccount,
  AnchorIdlField,
  AnchorIdlTypeDefinition,
  AnchorType,
  FixturePack,
  FixtureScenario,
  InstructionFixture,
} from './types.js'

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

export function parseIdl(input: string | AnchorIdl): AnchorIdl {
  const parsed = typeof input === 'string' ? JSON.parse(input) as AnchorIdl : input
  if (!parsed || !Array.isArray(parsed.instructions) || parsed.instructions.length === 0) {
    throw new Error('IDL must contain at least one instruction')
  }
  for (const instruction of parsed.instructions) {
    if (!instruction.name || !Array.isArray(instruction.accounts) || !Array.isArray(instruction.args)) {
      throw new Error('Each instruction needs a name, accounts array, and args array')
    }
  }
  return parsed
}

export function generateFixturePack(
  input: string | AnchorIdl,
  options: { seed?: string; instruction?: string } = {},
): FixturePack {
  const idl = parseIdl(input)
  const seed = options.seed?.trim() || 'anchorfixture'
  const selected = options.instruction
    ? idl.instructions.filter((instruction) => instruction.name === options.instruction)
    : idl.instructions

  if (selected.length === 0) throw new Error(`Instruction not found: ${options.instruction}`)

  const instructions = selected.map((instruction) => {
    const accounts = flattenAccounts(instruction.accounts).map(({ account, path }) =>
      accountFixture(account, path, `${seed}:${instruction.name}:${path}`),
    )
    const normalArgs = Object.fromEntries(
      instruction.args.map((arg) => [arg.name, valueForType(arg, idl.types, `${seed}:${instruction.name}:${arg.name}`)]),
    )
    const boundaryArgs = Object.fromEntries(
      instruction.args.map((arg) => [arg.name, boundaryValueForType(arg, idl.types, `${seed}:${instruction.name}:${arg.name}:boundary`)]),
    )

    return {
      instruction: instruction.name,
      discriminator: instruction.discriminator,
      accountMatrix: accounts,
      scenarios: buildScenarios(instruction.name, accounts, normalArgs, boundaryArgs),
    } satisfies InstructionFixture
  })

  const allScenarios = instructions.flatMap((instruction) => instruction.scenarios)
  const allAccounts = instructions.flatMap((instruction) => instruction.accountMatrix)
  const fingerprint = fingerprintOf(idl)
  const programName = idl.metadata?.name || idl.name || 'anchor-program'

  return {
    schema: 'anchorfixture/v1',
    seed,
    idlFingerprint: fingerprint,
    program: {
      name: programName,
      address: idl.address || deterministicPublicKey(`${seed}:${programName}:program`),
      version: idl.metadata?.version || idl.version || 'unknown',
    },
    summary: {
      instructions: instructions.length,
      scenarios: allScenarios.length,
      negativeScenarios: allScenarios.filter((scenario) => scenario.kind === 'negative').length,
      signerAccounts: new Set(allAccounts.filter((account) => account.signer).map((account) => account.path)).size,
    },
    instructions,
  }
}

export function generateVitestSource(pack: FixturePack): string {
  const instructionNames = pack.instructions.map((instruction) => instruction.instruction)
  return `import { describe, expect, it } from 'vitest'\nimport pack from './anchorfixture.pack.json'\n\ndescribe('${pack.program.name} fixture contract', () => {\n  it('keeps the IDL fingerprint stable', () => {\n    expect(pack.idlFingerprint).toBe('${pack.idlFingerprint}')\n  })\n\n  it('covers every selected instruction', () => {\n    expect(pack.instructions.map((item) => item.instruction)).toEqual(${JSON.stringify(instructionNames)})\n  })\n\n  it('contains a success path and negative coverage per instruction', () => {\n    for (const instruction of pack.instructions) {\n      expect(instruction.scenarios.some((scenario) => scenario.kind === 'success')).toBe(true)\n      expect(instruction.scenarios.some((scenario) => scenario.kind === 'negative')).toBe(true)\n    }\n  })\n\n  it('never asks an undeclared account to sign', () => {\n    for (const instruction of pack.instructions) {\n      const declared = new Set(instruction.accountMatrix.filter((account) => account.signer).map((account) => account.path))\n      for (const scenario of instruction.scenarios) {\n        expect(scenario.signers.every((signer) => declared.has(signer))).toBe(true)\n      }\n    }\n  })\n})\n`
}

export function fingerprintOf(value: unknown): string {
  const stable = stableStringify(value)
  return `fnv1a32:${fnv1a(stable).toString(16).padStart(8, '0')}`
}

function buildScenarios(
  instruction: string,
  accounts: AccountFixture[],
  args: Record<string, unknown>,
  boundaryArgs: Record<string, unknown>,
): FixtureScenario[] {
  const signers = accounts.filter((account) => account.signer).map((account) => account.path)
  const scenarios: FixtureScenario[] = [
    {
      id: `${instruction}.success`,
      instruction,
      kind: 'success',
      title: 'Valid account and argument set',
      expectedOutcome: 'pass',
      accounts,
      args,
      signers,
      mutation: { type: 'none', note: 'IDL constraints are preserved.' },
    },
  ]

  for (const signer of accounts.filter((account) => account.signer)) {
    scenarios.push({
      id: `${instruction}.missing-signer.${signer.path}`,
      instruction,
      kind: 'negative',
      title: `Missing signature: ${signer.path}`,
      expectedOutcome: 'reject',
      expectedError: 'MISSING_REQUIRED_SIGNATURE',
      accounts,
      args,
      signers: signers.filter((path) => path !== signer.path),
      mutation: { type: 'missing-signer', account: signer.path, note: `${signer.path} is declared as a signer.` },
    })
  }

  for (const writable of accounts.filter((account) => account.writable)) {
    scenarios.push({
      id: `${instruction}.readonly.${writable.path}`,
      instruction,
      kind: 'negative',
      title: `Writable account forced read-only: ${writable.path}`,
      expectedOutcome: 'reject',
      expectedError: 'ACCOUNT_NOT_WRITABLE',
      accounts: accounts.map((account) => account.path === writable.path
        ? { ...account, writable: false }
        : account),
      args,
      signers,
      mutation: { type: 'readonly-account', account: writable.path, note: `${writable.path} must be writable.` },
    })
  }

  for (const pda of accounts.filter((account) => account.source === 'pda')) {
    scenarios.push({
      id: `${instruction}.invalid-pda.${pda.path}`,
      instruction,
      kind: 'negative',
      title: `Invalid PDA derivation: ${pda.path}`,
      expectedOutcome: 'reject',
      expectedError: 'CONSTRAINT_SEEDS',
      accounts: accounts.map((account) => account.path === pda.path
        ? { ...account, publicKey: deterministicPublicKey(`${pda.publicKey}:invalid`) }
        : account),
      args,
      signers,
      mutation: { type: 'invalid-pda', account: pda.path, note: 'Uses a deterministic non-canonical PDA.' },
    })
  }

  scenarios.push({
    id: `${instruction}.boundary-args`,
    instruction,
    kind: 'boundary',
    title: 'Maximum and empty-value boundaries',
    expectedOutcome: 'pass',
    accounts,
    args: boundaryArgs,
    signers,
    mutation: { type: 'boundary-args', note: 'Numeric maxima, empty collections, and optional nulls.' },
  })

  return scenarios
}

function flattenAccounts(accounts: AnchorIdlAccount[], prefix = ''): Array<{ account: AnchorIdlAccount; path: string }> {
  const flattened: Array<{ account: AnchorIdlAccount; path: string }> = []
  for (const account of accounts) {
    const path = prefix ? `${prefix}.${account.name}` : account.name
    if (account.accounts?.length) flattened.push(...flattenAccounts(account.accounts, path))
    else flattened.push({ account, path })
  }
  return flattened
}

function accountFixture(account: AnchorIdlAccount, path: string, seed: string): AccountFixture {
  return {
    path,
    name: account.name,
    publicKey: account.address || deterministicPublicKey(seed),
    signer: Boolean(account.signer ?? account.isSigner),
    writable: Boolean(account.writable ?? account.isMut),
    source: account.address ? 'fixed' : account.pda ? 'pda' : 'generated',
  }
}

function valueForType(field: AnchorIdlField, definitions: AnchorIdlTypeDefinition[] | undefined, seed: string): unknown {
  return valueFromType(field.type, definitions, seed, false)
}

function boundaryValueForType(field: AnchorIdlField, definitions: AnchorIdlTypeDefinition[] | undefined, seed: string): unknown {
  return valueFromType(field.type, definitions, seed, true)
}

function valueFromType(
  type: AnchorType,
  definitions: AnchorIdlTypeDefinition[] | undefined,
  seed: string,
  boundary: boolean,
): unknown {
  if (typeof type === 'string') {
    if (type === 'bool') return !boundary
    if (type === 'string') return boundary ? '' : 'fixture-alpha'
    if (type === 'bytes') return boundary ? [] : [1, 2, 3, 4]
    if (type === 'pubkey' || type === 'publicKey') return deterministicPublicKey(seed)
    if (/^u(8|16|32)$/.test(type)) return boundary ? Number(2n ** BigInt(type.slice(1)) - 1n) : 7
    if (/^i(8|16|32)$/.test(type)) return boundary ? Number(2n ** (BigInt(type.slice(1)) - 1n) - 1n) : -7
    if (/^[ui](64|128|256)$/.test(type)) {
      const bits = BigInt(type.slice(1))
      const signed = type.startsWith('i')
      return boundary ? (signed ? 2n ** (bits - 1n) - 1n : 2n ** bits - 1n).toString() : '1000000'
    }
    return `<${type}>`
  }

  if ('option' in type) return boundary ? null : valueFromType(type.option, definitions, `${seed}:some`, false)
  if ('vec' in type) return boundary ? [] : [valueFromType(type.vec, definitions, `${seed}:0`, false)]
  if ('array' in type) {
    const length = Math.min(type.array[1], 32)
    return Array.from({ length }, (_, index) => valueFromType(type.array[0], definitions, `${seed}:${index}`, boundary))
  }
  if ('defined' in type) {
    const name = typeof type.defined === 'string' ? type.defined : type.defined.name
    const definition = definitions?.find((item) => item.name === name)
    if (!definition) return { __defined: name }
    if (definition.type.kind === 'struct') {
      return Object.fromEntries((definition.type.fields || []).map((field) => [
        field.name,
        valueFromType(field.type, definitions, `${seed}:${field.name}`, boundary),
      ]))
    }
    if (definition.type.kind === 'enum') return { variant: definition.type.variants?.[0]?.name || 'Unknown' }
    return { __defined: name }
  }
  return null
}

function deterministicPublicKey(seed: string): string {
  let state = fnv1a(seed) || 0x9e3779b9
  const bytes = new Uint8Array(32)
  for (let index = 0; index < bytes.length; index++) {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    bytes[index] = state & 0xff
  }
  return base58Encode(bytes)
}

function base58Encode(bytes: Uint8Array): string {
  const digits = [0]
  for (const byte of bytes) {
    let carry = byte
    for (let index = 0; index < digits.length; index++) {
      const value = digits[index] * 256 + carry
      digits[index] = value % 58
      carry = Math.floor(value / 58)
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = Math.floor(carry / 58)
    }
  }
  let output = ''
  for (const byte of bytes) {
    if (byte !== 0) break
    output += '1'
  }
  return output + digits.reverse().map((digit) => BASE58[digit]).join('')
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
    return `{${entries.join(',')}}`
  }
  return JSON.stringify(value)
}

function fnv1a(input: string): number {
  let hash = 0x811c9dc5
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}
