/**
 * Fix duplicate export blocks in dist/ files produced by Bun bundler.
 * Bun sometimes emits two export {} blocks with overlapping symbols.
 * This script merges all export blocks into a single block per file.
 */
import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const distDir = join(import.meta.dir, '..', 'dist')

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath))
    } else if (entry.name.endsWith('.js')) {
      files.push(fullPath)
    }
  }
  return files
}

let fixed = 0
const files = await walk(distDir)

for (const file of files) {
  const content = await readFile(file, 'utf-8')
  const exportRegex = /^export\s*\{([^}]+)\};?\s*$/gm
  const matches = [...content.matchAll(exportRegex)]
  if (matches.length <= 1) continue

  // Collect all exported names (preserving "as" aliases)
  const seen = new Set<string>()
  const exports: string[] = []
  for (const match of matches) {
    const items = match[1].split(',').map(s => s.trim()).filter(Boolean)
    for (const item of items) {
      // Use the full specifier (e.g. "foo as bar") as the key
      const key = item.replace(/\s+/g, ' ')
      if (!seen.has(key)) {
        seen.add(key)
        exports.push(key)
      }
    }
  }

  // Remove all export blocks
  let result = content
  for (let i = matches.length - 1; i >= 0; i--) {
    result = result.slice(0, matches[i].index!) + result.slice(matches[i].index! + matches[i][0].length)
  }

  // Append merged export block
  const merged = `export {\n  ${exports.join(',\n  ')}\n};\n`
  result = result.trimEnd() + '\n' + merged

  await writeFile(file, result)
  fixed++
}

console.log(`✓ Fixed duplicate exports in ${fixed} files`)
