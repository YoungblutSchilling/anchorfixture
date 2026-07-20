import { describe, expect, it } from 'vitest'
import sample from '../fixtures/counter-idl.json'
import { fingerprintOf, generateFixturePack, generateVitestSource, parseIdl } from './core.js'

describe('AnchorFixture generator', () => {
  it('parses an Anchor IDL and creates deterministic output', () => {
    const first = generateFixturePack(sample, { seed: 'review' })
    const second = generateFixturePack(sample, { seed: 'review' })
    expect(first).toEqual(second)
    expect(first.schema).toBe('anchorfixture/v1')
    expect(first.summary.instructions).toBe(3)
  })

  it('generates success, signer, mutability, PDA, and boundary coverage', () => {
    const pack = generateFixturePack(sample, { instruction: 'initialize' })
    const types = new Set(pack.instructions[0].scenarios.map((scenario) => scenario.mutation.type))
    expect(types).toEqual(new Set(['none', 'missing-signer', 'readonly-account', 'invalid-pda', 'boundary-args']))
    expect(pack.summary.negativeScenarios).toBeGreaterThanOrEqual(3)

    const readonly = pack.instructions[0].scenarios.find((scenario) => scenario.id === 'initialize.readonly.counter')
    expect(readonly?.accounts.find((account) => account.path === 'counter')?.writable).toBe(false)
    expect(pack.instructions[0].accountMatrix.find((account) => account.path === 'counter')?.writable).toBe(true)
  })

  it('changes generated accounts when the seed changes', () => {
    const alpha = generateFixturePack(sample, { seed: 'alpha', instruction: 'increment' })
    const beta = generateFixturePack(sample, { seed: 'beta', instruction: 'increment' })
    expect(alpha.instructions[0].accountMatrix[0].publicKey).not.toBe(beta.instructions[0].accountMatrix[0].publicKey)
  })

  it('keeps fixed program addresses and emits runnable Vitest source', () => {
    const pack = generateFixturePack(sample)
    expect(pack.program.address).toBe(sample.address)
    expect(generateVitestSource(pack)).toContain("describe('fixture_counter fixture contract'")
  })

  it('rejects malformed and unknown instruction input', () => {
    expect(() => parseIdl('{"instructions":[]}')).toThrow('at least one instruction')
    expect(() => generateFixturePack(sample, { instruction: 'missing' })).toThrow('Instruction not found')
  })

  it('fingerprints objects independent of property order', () => {
    expect(fingerprintOf({ a: 1, b: 2 })).toBe(fingerprintOf({ b: 2, a: 1 }))
  })
})
