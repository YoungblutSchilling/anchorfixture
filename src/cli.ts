#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { generateFixturePack, generateVitestSource } from './core.js'

interface CliOptions {
  input: string
  out: string
  seed?: string
  instruction?: string
}

function parseArgs(argv: string[]): CliOptions {
  const positional = argv.filter((arg) => !arg.startsWith('--'))
  const value = (flag: string) => {
    const index = argv.indexOf(flag)
    return index >= 0 ? argv[index + 1] : undefined
  }
  const input = positional[0]
  if (!input || argv.includes('--help')) {
    console.log('Usage: anchorfixture <idl.json> [--out ./fixtures] [--seed name] [--instruction name]')
    process.exit(input ? 0 : 1)
  }
  return {
    input,
    out: value('--out') || './anchorfixture-output',
    seed: value('--seed'),
    instruction: value('--instruction'),
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const source = await readFile(resolve(options.input), 'utf8')
  const pack = generateFixturePack(source, { seed: options.seed, instruction: options.instruction })
  const output = resolve(options.out)
  await mkdir(output, { recursive: true })
  const packPath = join(output, 'anchorfixture.pack.json')
  const specPath = join(output, 'anchorfixture.pack.spec.ts')
  await writeFile(packPath, `${JSON.stringify(pack, null, 2)}\n`, 'utf8')
  await writeFile(specPath, generateVitestSource(pack), 'utf8')
  console.log(JSON.stringify({
    input: basename(options.input),
    output: dirname(packPath),
    fingerprint: pack.idlFingerprint,
    instructions: pack.summary.instructions,
    scenarios: pack.summary.scenarios,
    files: [packPath, specPath],
  }, null, 2))
}

main().catch((error) => {
  console.error(`anchorfixture: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
