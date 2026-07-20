import { describe, expect, it } from 'vitest'
import pack from './anchorfixture.pack.json'

describe('fixture_counter fixture contract', () => {
  it('keeps the IDL fingerprint stable', () => {
    expect(pack.idlFingerprint).toBe('fnv1a32:7c4fc5e4')
  })

  it('covers every selected instruction', () => {
    expect(pack.instructions.map((item) => item.instruction)).toEqual(["initialize","increment","setConfig"])
  })

  it('contains a success path and negative coverage per instruction', () => {
    for (const instruction of pack.instructions) {
      expect(instruction.scenarios.some((scenario) => scenario.kind === 'success')).toBe(true)
      expect(instruction.scenarios.some((scenario) => scenario.kind === 'negative')).toBe(true)
    }
  })

  it('never asks an undeclared account to sign', () => {
    for (const instruction of pack.instructions) {
      const declared = new Set(instruction.accountMatrix.filter((account) => account.signer).map((account) => account.path))
      for (const scenario of instruction.scenarios) {
        expect(scenario.signers.every((signer) => declared.has(signer))).toBe(true)
      }
    }
  })
})
