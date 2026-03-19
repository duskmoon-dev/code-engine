#!/usr/bin/env bun
/**
 * Copy pre-compiled parser runtime files from npm packages
 * and rewrite their imports to use our internal module paths.
 */

import { readFile, writeFile, mkdir, copyFile } from "fs/promises";
import { join, posix, dirname } from "path";

const NPM_DIR = "/tmp/lezer-parsers/node_modules";
const SRC_DIR = join(import.meta.dir, "..", "src");

interface ParserSource {
  npm: string;           // npm package path
  dest: string;          // destination relative to src/
  filename?: string;     // output filename (default: parser.js)
}

// Lezer grammar parsers (from @lezer/* packages)
const LEZER_PARSERS: ParserSource[] = [
  { npm: "@lezer/javascript/dist/index.js", dest: "lang/javascript", filename: "parser.js" },
  { npm: "@lezer/java/dist/index.js", dest: "lang/java", filename: "parser.js" },
  { npm: "@lezer/json/dist/index.js", dest: "lang/json", filename: "parser.js" },
  { npm: "@lezer/cpp/dist/index.js", dest: "lang/cpp", filename: "parser.js" },
  { npm: "@lezer/php/dist/index.js", dest: "lang/php", filename: "parser.js" },
  { npm: "@lezer/python/dist/index.js", dest: "lang/python", filename: "parser.js" },
  { npm: "@lezer/go/dist/index.js", dest: "lang/go", filename: "parser.js" },
  { npm: "@lezer/css/dist/index.js", dest: "lang/css", filename: "parser.js" },
  { npm: "@lezer/sass/dist/index.js", dest: "lang/sass", filename: "parser.js" },
  { npm: "@lezer/html/dist/index.js", dest: "lang/html", filename: "parser.js" },
  { npm: "@lezer/rust/dist/index.js", dest: "lang/rust", filename: "parser.js" },
  { npm: "@lezer/xml/dist/index.js", dest: "lang/xml", filename: "parser.js" },
  { npm: "@lezer/yaml/dist/index.js", dest: "lang/yaml", filename: "parser.js" },
  { npm: "@lezer/lezer/dist/index.js", dest: "lang/lezer", filename: "parser.js" },
];

// Language packs that have their own grammar (from @codemirror/lang-* packages)
// These contain embedded parser tables and may import from @lezer/* and @codemirror/*
const LANG_PARSERS: ParserSource[] = [
  { npm: "@codemirror/lang-sql/dist/index.js", dest: "lang/sql", filename: "sql.grammar.js" },
  { npm: "@codemirror/lang-vue/dist/index.js", dest: "lang/vue", filename: "vue.grammar.js" },
  { npm: "@codemirror/lang-angular/dist/index.js", dest: "lang/angular", filename: "angular.grammar.js" },
  { npm: "@codemirror/lang-liquid/dist/index.js", dest: "lang/liquid", filename: "liquid.grammar.js" },
  { npm: "@codemirror/lang-wast/dist/index.js", dest: "lang/wast", filename: "wast.grammar.js" },
  { npm: "@codemirror/lang-less/dist/index.js", dest: "lang/less", filename: "less.grammar.js" },
  { npm: "@codemirror/lang-lezer/dist/index.js", dest: "lang/lezer", filename: "lang-lezer.grammar.js" },
];

// Markdown is special — it's not an LR parser
const MARKDOWN_SRC = "@lezer/markdown/dist/index.js";

function rewriteImports(source: string, destRelPath: string): string {
  const rewrites: Record<string, string> = {
    "@lezer/lr": "parser/lr",
    "@lezer/highlight": "parser/highlight",
    "@lezer/common": "parser/common",
    "@codemirror/state": "core/state",
    "@codemirror/view": "core/view",
    "@codemirror/language": "core/language",
    "@codemirror/autocomplete": "core/autocomplete",
    "@codemirror/search": "core/search",
    "@codemirror/lint": "core/lint",
    "@codemirror/commands": "core/commands",
    "@lezer/javascript": "lang/javascript/parser",
    "@lezer/html": "lang/html/parser",
    "@lezer/css": "lang/css/parser",
    "@lezer/xml": "lang/xml/parser",
    "@lezer/json": "lang/json/parser",
    "@codemirror/lang-javascript": "lang/javascript",
    "@codemirror/lang-html": "lang/html",
    "@codemirror/lang-css": "lang/css",
    "@codemirror/lang-json": "lang/json",
    "@codemirror/lang-xml": "lang/xml",
    "@codemirror/lang-markdown": "lang/markdown",
    "@codemirror/lang-python": "lang/python",
    "style-mod": "core/view/style-mod",
    "crelt": "core/view/crelt",
  };

  const entries = Object.entries(rewrites).sort((a, b) => b[0].length - a[0].length);
  const fromDir = dirname(destRelPath);

  for (const [external, internal] of entries) {
    let rel = posix.relative(fromDir, internal);
    if (!rel.startsWith(".")) rel = "./" + rel;
    const escaped = external.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    source = source.replace(
      new RegExp(`(from\\s+['"])${escaped}(['"])`, "g"),
      `$1${rel}$2`
    );
    // Also handle re-exports: export { ... } from '...'
    source = source.replace(
      new RegExp(`(from\\s+['"])${escaped}(/[^'"]*)?(['"])`, "g"),
      (_, prefix, subpath, suffix) => {
        if (subpath) {
          let sub = posix.relative(fromDir, internal + subpath);
          if (!sub.startsWith(".")) sub = "./" + sub;
          return `${prefix}${sub}${suffix}`;
        }
        return `${prefix}${rel}${suffix}`;
      }
    );
  }
  return source;
}

async function copyAndRewrite(source: ParserSource) {
  const srcPath = join(NPM_DIR, source.npm);
  const filename = source.filename || "parser.js";
  const destPath = join(SRC_DIR, source.dest, filename);
  const destRelPath = posix.join(source.dest, filename);

  await mkdir(join(SRC_DIR, source.dest), { recursive: true });

  let content = await readFile(srcPath, "utf-8");
  content = rewriteImports(content, destRelPath);
  await writeFile(destPath, content, "utf-8");
  console.log(`  ${source.npm} -> src/${destRelPath}`);
}

async function main() {
  console.log("=== Copying pre-compiled parser runtime files ===\n");

  console.log("--- Lezer parsers ---");
  for (const p of LEZER_PARSERS) {
    await copyAndRewrite(p);
  }

  console.log("\n--- Language-specific grammar bundles ---");
  for (const p of LANG_PARSERS) {
    try {
      await copyAndRewrite(p);
    } catch (err: any) {
      console.warn(`  ⚠ Skipped ${p.npm}: ${err.message}`);
    }
  }

  // Markdown parser (special case)
  console.log("\n--- Markdown parser ---");
  try {
    const mdSrc = join(NPM_DIR, MARKDOWN_SRC);
    let content = await readFile(mdSrc, "utf-8");
    content = rewriteImports(content, "lang/markdown/parser.js");
    await writeFile(join(SRC_DIR, "lang/markdown/parser.js"), content, "utf-8");
    console.log(`  @lezer/markdown -> src/lang/markdown/parser.js`);
  } catch (err: any) {
    console.warn(`  ⚠ Markdown: ${err.message}`);
  }

  console.log("\n✓ Parser copy complete");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
