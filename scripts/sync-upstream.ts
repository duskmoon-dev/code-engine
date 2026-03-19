#!/usr/bin/env bun
/**
 * Upstream sync script for @duskmoon-dev/code-engine.
 *
 * Pulls latest changes from all upstream CodeMirror 6 + Lezer repos,
 * applies them to the monolith, rewrites imports, and runs tests.
 *
 * Usage: bun run scripts/sync-upstream.ts [--module <module-name>] [--dry-run]
 */

import { join, relative, dirname, posix } from "path";

const ROOT = join(import.meta.dir, "..");

// Import rewrite map (same as collapse script)
const IMPORT_REWRITES: Record<string, string> = {
  "@codemirror/state": "core/state",
  "@codemirror/view": "core/view",
  "@codemirror/language": "core/language",
  "@codemirror/commands": "core/commands",
  "@codemirror/search": "core/search",
  "@codemirror/autocomplete": "core/autocomplete",
  "@codemirror/lint": "core/lint",
  "@codemirror/collab": "core/collab",
  "@codemirror/language-data": "core/language-data",
  "@codemirror/merge": "core/merge",
  "@codemirror/lsp-client": "core/lsp",
  "@lezer/common": "parser/common",
  "@lezer/lr": "parser/lr",
  "@lezer/highlight": "parser/highlight",
  "style-mod": "core/view/style-mod",
  "crelt": "core/view/crelt",
  "w3c-keyname": "core/view/w3c-keyname",
  "@marijn/find-cluster-break": "core/state/find-cluster-break",
};

// Module → upstream repo mapping
const MODULE_REPOS: Record<string, string> = {
  "core/state": "codemirror/state",
  "core/view": "codemirror/view",
  "core/language": "codemirror/language",
  "core/commands": "codemirror/commands",
  "core/search": "codemirror/search",
  "core/autocomplete": "codemirror/autocomplete",
  "core/lint": "codemirror/lint",
  "core/collab": "codemirror/collab",
  "core/language-data": "codemirror/language-data",
  "core/merge": "codemirror/merge",
  "core/lsp": "codemirror/lsp-client",
  "parser/common": "lezer-parser/common",
  "parser/lr": "lezer-parser/lr",
  "parser/highlight": "lezer-parser/highlight",
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function computeRelative(fromFile: string, toModule: string): string {
  const fromDir = dirname(fromFile);
  let rel = posix.relative(fromDir, toModule);
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

export function rewriteImports(source: string, filePath: string): string {
  const entries = Object.entries(IMPORT_REWRITES).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [external, internal] of entries) {
    const relPath = computeRelative(filePath, internal);
    const escaped = escapeRegex(external);
    source = source.replace(
      new RegExp(`(from\\s+["'])${escaped}(/[^"']*)?["']`, "g"),
      (match, prefix, subpath) => {
        if (subpath) {
          return `${prefix}${computeRelative(filePath, internal + subpath)}"`;
        }
        return `${prefix}${relPath}"`;
      }
    );
  }
  return source;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const moduleIdx = args.indexOf("--module");
  const targetModule = moduleIdx >= 0 ? args[moduleIdx + 1] : null;

  console.log("=== @duskmoon-dev/code-engine upstream sync ===");
  if (dryRun) console.log("  (dry run mode)");
  if (targetModule) console.log(`  Target module: ${targetModule}`);

  console.log("\nSync flow:");
  console.log("  1. Clone/pull upstream repos into temp directory");
  console.log("  2. For each module: diff, apply, rewrite imports, type check, test");
  console.log("  3. Update UPSTREAM.md");
  console.log("  4. Run full build + test suite");
  console.log("\nTo implement: run the collapse-upstream.ts script for a full re-sync,");
  console.log("or use 'git diff' against upstream for incremental syncs.");
  console.log("\nThis script provides the import rewriting utilities used by the sync process.");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
