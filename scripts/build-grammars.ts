#!/usr/bin/env bun
/**
 * Compile .grammar files to TypeScript parser tables using @lezer/generator.
 * This is a build-time step — the generated parsers are committed to the repo.
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { join, basename } from "path";

const ROOT = join(import.meta.dir, "..");
const GRAMMAR_DIR = join(ROOT, "grammar");

async function main() {
  console.log("Building grammars...\n");

  let entries: string[];
  try {
    entries = await readdir(GRAMMAR_DIR);
  } catch {
    console.log("No grammar/ directory found. Skipping.");
    return;
  }

  const grammarFiles = entries.filter(f => f.endsWith(".grammar"));
  console.log(`Found ${grammarFiles.length} grammar files\n`);

  for (const file of grammarFiles) {
    const lang = basename(file, ".grammar");
    const grammarPath = join(GRAMMAR_DIR, file);

    console.log(`  Compiling ${file}...`);

    try {
      const { buildParserFile } = await import("@lezer/generator");
      const grammarText = await readFile(grammarPath, "utf-8");

      const output = buildParserFile(grammarText, {
        fileName: `${lang}.grammar`,
      });

      const destDir = join(ROOT, "src", "lang", lang);
      await writeFile(join(destDir, "parser.js"), output, "utf-8");
      console.log(`    → src/lang/${lang}/parser.js`);
    } catch (err: any) {
      console.error(`    ✗ Failed: ${err.message}`);
    }
  }

  console.log("\n✓ Grammar compilation complete");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
