import Ajv2020 from 'ajv/dist/2020.js'
import { describe, expect, it } from 'vitest'
import sample from '../fixtures/counter-idl.json'
import schema from '../schema/anchorfixture.schema.json'
import { generateFixturePack } from './core.js'

describe('AnchorFixture public schema', () => {
  it('validates generated fixture packs', () => {
    const validate = new Ajv2020({ allErrors: true }).compile(schema)
    const fixture = generateFixturePack(sample, { seed: 'schema-contract' })
    expect(validate(fixture), JSON.stringify(validate.errors, null, 2)).toBe(true)
  })
})
