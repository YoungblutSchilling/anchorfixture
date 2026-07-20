export type AnchorType =
  | string
  | { option: AnchorType }
  | { vec: AnchorType }
  | { array: [AnchorType, number] }
  | { defined: string | { name: string } }

export interface AnchorIdlField {
  name: string
  type: AnchorType
}

export interface AnchorIdlAccount {
  name: string
  writable?: boolean
  signer?: boolean
  isMut?: boolean
  isSigner?: boolean
  address?: string
  pda?: unknown
  accounts?: AnchorIdlAccount[]
}

export interface AnchorIdlInstruction {
  name: string
  discriminator?: number[]
  accounts: AnchorIdlAccount[]
  args: AnchorIdlField[]
}

export interface AnchorIdlTypeDefinition {
  name: string
  type: {
    kind: string
    fields?: AnchorIdlField[]
    variants?: Array<{ name: string; fields?: AnchorIdlField[] | AnchorType[] }>
  }
}

export interface AnchorIdl {
  address?: string
  name?: string
  version?: string
  metadata?: { name?: string; version?: string; spec?: string; description?: string }
  instructions: AnchorIdlInstruction[]
  types?: AnchorIdlTypeDefinition[]
}

export interface AccountFixture {
  path: string
  name: string
  publicKey: string
  signer: boolean
  writable: boolean
  source: 'fixed' | 'generated' | 'pda'
}

export interface FixtureMutation {
  type: 'none' | 'missing-signer' | 'readonly-account' | 'invalid-pda' | 'boundary-args'
  account?: string
  note: string
}

export interface FixtureScenario {
  id: string
  instruction: string
  kind: 'success' | 'negative' | 'boundary'
  title: string
  expectedOutcome: 'pass' | 'reject'
  expectedError?: string
  accounts: AccountFixture[]
  args: Record<string, unknown>
  signers: string[]
  mutation: FixtureMutation
}

export interface InstructionFixture {
  instruction: string
  discriminator?: number[]
  accountMatrix: AccountFixture[]
  scenarios: FixtureScenario[]
}

export interface FixturePack {
  schema: 'anchorfixture/v1'
  seed: string
  idlFingerprint: string
  program: { name: string; address: string; version: string }
  summary: {
    instructions: number
    scenarios: number
    negativeScenarios: number
    signerAccounts: number
  }
  instructions: InstructionFixture[]
}
