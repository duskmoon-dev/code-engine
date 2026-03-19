#!/usr/bin/env bun
/**
 * Collapse all upstream CodeMirror 6 + Lezer repos into the monolith structure.
 * This script:
 * 1. Copies source files from cloned upstream repos into src/
 * 2. Rewrites all @codemirror/*, @lezer/*, and style-mod imports to relative paths
 * 3. Records upstream commit SHAs in UPSTREAM.md
 */

import { readdir, copyFile, mkdir, readFile, writeFile, stat } from "fs/promises";
import { join, relative, dirname, posix } from "path";

const UPSTREAM_DIR = "/tmp/cm6-upstream";
const PROJECT_ROOT = join(import.meta.dir, "..");
const SRC_DIR = join(PROJECT_ROOT, "src");

// Mapping: upstream clone dir name -> { srcDir, destDir (relative to src/) }
interface ModuleMapping {
  upstream: string; // clone dir name under UPSTREAM_DIR
  srcSubdir: string; // subdirectory within the clone that has source files
  dest: string; // destination under src/
  fileFilter?: (name: string) => boolean; // optional file filter
}

const CORE_MODULES: ModuleMapping[] = [
  { upstream: "codemirror-state", srcSubdir: "src", dest: "core/state" },
  { upstream: "codemirror-view", srcSubdir: "src", dest: "core/view" },
  { upstream: "codemirror-language", srcSubdir: "src", dest: "core/language" },
  { upstream: "codemirror-commands", srcSubdir: "src", dest: "core/commands" },
  { upstream: "codemirror-search", srcSubdir: "src", dest: "core/search" },
  { upstream: "codemirror-autocomplete", srcSubdir: "src", dest: "core/autocomplete" },
  { upstream: "codemirror-lint", srcSubdir: "src", dest: "core/lint" },
  { upstream: "codemirror-collab", srcSubdir: "src", dest: "core/collab" },
  { upstream: "codemirror-language-data", srcSubdir: "src", dest: "core/language-data" },
  { upstream: "codemirror-merge", srcSubdir: "src", dest: "core/merge" },
  { upstream: "codemirror-lsp-client", srcSubdir: "src", dest: "core/lsp" },
];

const PARSER_MODULES: ModuleMapping[] = [
  { upstream: "lezer-parser-common", srcSubdir: "src", dest: "parser/common" },
  { upstream: "lezer-parser-lr", srcSubdir: "src", dest: "parser/lr" },
  { upstream: "lezer-parser-highlight", srcSubdir: "src", dest: "parser/highlight" },
];

// Language packs: each combines a @codemirror/lang-X (src/) and a @lezer/X (src/ .grammar + generated parser)
const LANG_MODULES: ModuleMapping[] = [
  { upstream: "codemirror-lang-javascript", srcSubdir: "src", dest: "lang/javascript" },
  { upstream: "codemirror-lang-java", srcSubdir: "src", dest: "lang/java" },
  { upstream: "codemirror-lang-json", srcSubdir: "src", dest: "lang/json" },
  { upstream: "codemirror-lang-cpp", srcSubdir: "src", dest: "lang/cpp" },
  { upstream: "codemirror-lang-php", srcSubdir: "src", dest: "lang/php" },
  { upstream: "codemirror-lang-python", srcSubdir: "src", dest: "lang/python" },
  { upstream: "codemirror-lang-go", srcSubdir: "src", dest: "lang/go" },
  { upstream: "codemirror-lang-css", srcSubdir: "src", dest: "lang/css" },
  { upstream: "codemirror-lang-sass", srcSubdir: "src", dest: "lang/sass" },
  { upstream: "codemirror-lang-html", srcSubdir: "src", dest: "lang/html" },
  { upstream: "codemirror-lang-sql", srcSubdir: "src", dest: "lang/sql" },
  { upstream: "codemirror-lang-rust", srcSubdir: "src", dest: "lang/rust" },
  { upstream: "codemirror-lang-xml", srcSubdir: "src", dest: "lang/xml" },
  { upstream: "codemirror-lang-markdown", srcSubdir: "src", dest: "lang/markdown" },
  { upstream: "codemirror-lang-lezer", srcSubdir: "src", dest: "lang/lezer" },
  { upstream: "codemirror-lang-wast", srcSubdir: "src", dest: "lang/wast" },
  { upstream: "codemirror-lang-angular", srcSubdir: "src", dest: "lang/angular" },
  { upstream: "codemirror-lang-vue", srcSubdir: "src", dest: "lang/vue" },
  { upstream: "codemirror-lang-liquid", srcSubdir: "src", dest: "lang/liquid" },
  { upstream: "codemirror-lang-less", srcSubdir: "src", dest: "lang/less" },
  { upstream: "codemirror-lang-yaml", srcSubdir: "src", dest: "lang/yaml" },
  { upstream: "codemirror-lang-jinja", srcSubdir: "src", dest: "lang/jinja" },
];

// Lezer grammar repos — we need the pre-compiled parser output (.js/.ts files from src/)
const LEZER_GRAMMAR_MODULES: { upstream: string; lang: string }[] = [
  { upstream: "lezer-parser-javascript", lang: "javascript" },
  { upstream: "lezer-parser-java", lang: "java" },
  { upstream: "lezer-parser-json", lang: "json" },
  { upstream: "lezer-parser-cpp", lang: "cpp" },
  { upstream: "lezer-parser-php", lang: "php" },
  { upstream: "lezer-parser-python", lang: "python" },
  { upstream: "lezer-parser-go", lang: "go" },
  { upstream: "lezer-parser-css", lang: "css" },
  { upstream: "lezer-parser-sass", lang: "sass" },
  { upstream: "lezer-parser-html", lang: "html" },
  { upstream: "lezer-parser-rust", lang: "rust" },
  { upstream: "lezer-parser-xml", lang: "xml" },
  { upstream: "lezer-parser-markdown", lang: "markdown" },
  { upstream: "lezer-parser-lezer", lang: "lezer" },
  { upstream: "lezer-parser-yaml", lang: "yaml" },
];

// Import rewrite map: external package -> internal module path (relative to src/)
const IMPORT_MAP: Record<string, string> = {
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
  "@lezer/javascript": "lang/javascript/parser",
  "@lezer/java": "lang/java/parser",
  "@lezer/json": "lang/json/parser",
  "@lezer/cpp": "lang/cpp/parser",
  "@lezer/php": "lang/php/parser",
  "@lezer/python": "lang/python/parser",
  "@lezer/go": "lang/go/parser",
  "@lezer/css": "lang/css/parser",
  "@lezer/sass": "lang/sass/parser",
  "@lezer/html": "lang/html/parser",
  "@lezer/rust": "lang/rust/parser",
  "@lezer/xml": "lang/xml/parser",
  "@lezer/markdown": "lang/markdown/parser",
  "@lezer/lezer": "lang/lezer/parser",
  "@lezer/yaml": "lang/yaml/parser",
  "style-mod": "core/view/style-mod",
  // Cross-lang references
  "@codemirror/lang-javascript": "lang/javascript",
  "@codemirror/lang-java": "lang/java",
  "@codemirror/lang-json": "lang/json",
  "@codemirror/lang-cpp": "lang/cpp",
  "@codemirror/lang-php": "lang/php",
  "@codemirror/lang-python": "lang/python",
  "@codemirror/lang-go": "lang/go",
  "@codemirror/lang-css": "lang/css",
  "@codemirror/lang-sass": "lang/sass",
  "@codemirror/lang-html": "lang/html",
  "@codemirror/lang-sql": "lang/sql",
  "@codemirror/lang-rust": "lang/rust",
  "@codemirror/lang-xml": "lang/xml",
  "@codemirror/lang-markdown": "lang/markdown",
  "@codemirror/lang-lezer": "lang/lezer",
  "@codemirror/lang-wast": "lang/wast",
  "@codemirror/lang-angular": "lang/angular",
  "@codemirror/lang-vue": "lang/vue",
  "@codemirror/lang-liquid": "lang/liquid",
  "@codemirror/lang-less": "lang/less",
  "@codemirror/lang-yaml": "lang/yaml",
  "@codemirror/lang-jinja": "lang/jinja",
  "@codemirror/legacy-modes/mode": "lang/legacy",
  "@codemirror/theme-one-dark": "theme/one-dark",
  "codemirror": "setup",
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function computeRelativePath(fromFile: string, toModule: string): string {
  // fromFile is relative to src/, e.g. "core/view/editorview.ts"
  // toModule is relative to src/, e.g. "core/state"
  const fromDir = dirname(fromFile);
  let rel = posix.relative(fromDir, toModule);
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

function rewriteImports(source: string, filePath: string): string {
  // filePath is relative to src/
  // Sort by longest match first to avoid partial matches
  const entries = Object.entries(IMPORT_MAP).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [external, internal] of entries) {
    const relPath = computeRelativePath(filePath, internal);
    // Match: from "@codemirror/state" or from '@codemirror/state'
    // Also match imports with subpaths like '@codemirror/legacy-modes/mode/shell'
    const escaped = escapeRegex(external);
    // Handle subpath imports (e.g. @codemirror/legacy-modes/mode/shell)
    source = source.replace(
      new RegExp(`(from\\s+["'])${escaped}(/[^"']*)?["']`, "g"),
      (match, prefix, subpath) => {
        if (subpath) {
          return `${prefix}${computeRelativePath(filePath, internal + subpath)}"`;
        }
        return `${prefix}${relPath}"`;
      }
    );
    // Also handle dynamic imports: import("@codemirror/state")
    source = source.replace(
      new RegExp(`(import\\(["'])${escaped}(/[^"']*)?["']\\)`, "g"),
      (match, prefix, subpath) => {
        if (subpath) {
          return `${prefix}${computeRelativePath(filePath, internal + subpath)}")`;
        }
        return `${prefix}${relPath}")`;
      }
    );
  }
  return source;
}

async function copySourceFiles(
  srcDir: string,
  destDir: string,
  destRelativeToSrc: string
): Promise<string[]> {
  await mkdir(destDir, { recursive: true });
  const files: string[] = [];

  let entries: string[];
  try {
    entries = await readdir(srcDir);
  } catch {
    console.warn(`  Warning: source dir not found: ${srcDir}`);
    return files;
  }

  for (const entry of entries) {
    const srcPath = join(srcDir, entry);
    const destPath = join(destDir, entry);
    const s = await stat(srcPath);

    if (s.isDirectory()) {
      const subFiles = await copySourceFiles(
        srcPath,
        destPath,
        posix.join(destRelativeToSrc, entry)
      );
      files.push(...subFiles);
    } else if (
      entry.endsWith(".ts") ||
      entry.endsWith(".js") ||
      entry.endsWith(".d.ts")
    ) {
      // Skip README files
      if (entry === "README.md") continue;

      let content = await readFile(srcPath, "utf-8");
      const fileRelPath = posix.join(destRelativeToSrc, entry);
      content = rewriteImports(content, fileRelPath);
      await writeFile(destPath, content, "utf-8");
      files.push(fileRelPath);
    }
  }
  return files;
}

async function getUpstreamSHA(cloneDir: string): Promise<string> {
  const proc = Bun.spawnSync(["git", "rev-parse", "HEAD"], { cwd: cloneDir });
  return proc.stdout.toString().trim().substring(0, 7);
}

// ---- Main ----

async function main() {
  console.log("=== Collapsing upstream repos into monolith ===\n");

  const upstreamTracking: Array<{
    module: string;
    repo: string;
    sha: string;
  }> = [];

  // 1. Copy core modules
  console.log("--- Core Modules ---");
  for (const mod of CORE_MODULES) {
    const srcDir = join(UPSTREAM_DIR, mod.upstream, mod.srcSubdir);
    const destDir = join(SRC_DIR, mod.dest);
    console.log(`  ${mod.upstream} -> src/${mod.dest}`);
    await copySourceFiles(srcDir, destDir, mod.dest);
    const sha = await getUpstreamSHA(join(UPSTREAM_DIR, mod.upstream));
    upstreamTracking.push({
      module: mod.dest,
      repo: mod.upstream.replace("-", "/"),
      sha,
    });
  }

  // 2. Copy parser modules
  console.log("\n--- Parser Modules ---");
  for (const mod of PARSER_MODULES) {
    const srcDir = join(UPSTREAM_DIR, mod.upstream, mod.srcSubdir);
    const destDir = join(SRC_DIR, mod.dest);
    console.log(`  ${mod.upstream} -> src/${mod.dest}`);
    await copySourceFiles(srcDir, destDir, mod.dest);
    const sha = await getUpstreamSHA(join(UPSTREAM_DIR, mod.upstream));
    upstreamTracking.push({
      module: mod.dest,
      repo: mod.upstream.replace("-", "/").replace("lezer/parser/", "lezer-parser/"),
      sha,
    });
  }

  // 3. Copy language pack modules
  console.log("\n--- Language Packs ---");
  for (const mod of LANG_MODULES) {
    const srcDir = join(UPSTREAM_DIR, mod.upstream, mod.srcSubdir);
    const destDir = join(SRC_DIR, mod.dest);
    console.log(`  ${mod.upstream} -> src/${mod.dest}`);
    await copySourceFiles(srcDir, destDir, mod.dest);
    const sha = await getUpstreamSHA(join(UPSTREAM_DIR, mod.upstream));
    upstreamTracking.push({
      module: mod.dest,
      repo: mod.upstream.replace("codemirror-", "codemirror/"),
      sha,
    });
  }

  // 4. Copy Lezer grammar pre-compiled parsers into lang/ dirs
  console.log("\n--- Lezer Grammars (pre-compiled parsers) ---");
  for (const gram of LEZER_GRAMMAR_MODULES) {
    const gramDir = join(UPSTREAM_DIR, gram.upstream);
    const destDir = join(SRC_DIR, "lang", gram.lang);
    await mkdir(destDir, { recursive: true });

    // Copy the pre-compiled parser from src/ directory
    const gramSrcDir = join(gramDir, "src");
    try {
      const entries = await readdir(gramSrcDir);
      for (const entry of entries) {
        if (entry.endsWith(".js") || entry.endsWith(".ts") || entry.endsWith(".d.ts")) {
          if (entry === "README.md") continue;
          const srcPath = join(gramSrcDir, entry);
          // Rename highlight.js -> parser-highlight.js to avoid conflicts
          let destName = entry;
          if (entry.startsWith("highlight")) {
            destName = "parser-" + entry;
          }
          // For the main parser file, use "parser" prefix if it matches the language name
          if (entry === `${gram.lang}.grammar`) continue; // skip grammar source

          const destPath = join(destDir, destName);
          let content = await readFile(srcPath, "utf-8");
          const fileRelPath = posix.join("lang", gram.lang, destName);
          content = rewriteImports(content, fileRelPath);
          await writeFile(destPath, content, "utf-8");
        }
      }
      console.log(`  ${gram.upstream} -> src/lang/${gram.lang}/ (parser files)`);
    } catch {
      console.warn(`  Warning: no src/ in ${gram.upstream}`);
    }

    // Also copy .grammar files to grammar/ directory
    try {
      const entries = await readdir(gramSrcDir);
      for (const entry of entries) {
        if (entry.endsWith(".grammar")) {
          const grammarDestDir = join(PROJECT_ROOT, "grammar");
          await mkdir(grammarDestDir, { recursive: true });
          await copyFile(
            join(gramSrcDir, entry),
            join(grammarDestDir, entry)
          );
          console.log(`  ${entry} -> grammar/${entry}`);
        }
      }
    } catch {
      // Grammar source may not exist
    }

    const sha = await getUpstreamSHA(gramDir);
    upstreamTracking.push({
      module: `lang/${gram.lang} (parser)`,
      repo: gram.upstream.replace("lezer-parser-", "lezer-parser/"),
      sha,
    });
  }

  // 5. Copy style-mod (vendored into core/view/)
  console.log("\n--- style-mod (vendored) ---");
  const styleModDir = join(UPSTREAM_DIR, "marijnh-style-mod", "src");
  const styleModDest = join(SRC_DIR, "core", "view");
  await mkdir(styleModDest, { recursive: true });
  // style-mod is a .js + .d.ts, we copy as style-mod.ts
  const styleModJs = await readFile(join(styleModDir, "style-mod.js"), "utf-8");
  const styleModDts = await readFile(join(styleModDir, "style-mod.d.ts"), "utf-8");
  // Create a combined .ts file
  await writeFile(
    join(styleModDest, "style-mod.ts"),
    `// Vendored from marijnh/style-mod — MIT License\n// [DUSKMOON] Vendored to eliminate external dependency\n\n${styleModDts}\n\n// Implementation\n${styleModJs}\n`,
    "utf-8"
  );
  console.log("  marijnh/style-mod -> src/core/view/style-mod.ts");
  const styleModSha = await getUpstreamSHA(join(UPSTREAM_DIR, "marijnh-style-mod"));
  upstreamTracking.push({
    module: "core/view/style-mod",
    repo: "marijnh/style-mod",
    sha: styleModSha,
  });

  // 6. Copy theme-one-dark
  console.log("\n--- Theme ---");
  const oneDarkSrc = join(UPSTREAM_DIR, "codemirror-theme-one-dark", "src", "one-dark.ts");
  const themeDest = join(SRC_DIR, "theme");
  await mkdir(themeDest, { recursive: true });
  let oneDarkContent = await readFile(oneDarkSrc, "utf-8");
  oneDarkContent = rewriteImports(oneDarkContent, "theme/one-dark.ts");
  await writeFile(join(themeDest, "one-dark.ts"), oneDarkContent, "utf-8");
  console.log("  codemirror-theme-one-dark -> src/theme/one-dark.ts");

  // 7. Copy basicSetup
  console.log("\n--- basicSetup ---");
  const setupSrc = join(UPSTREAM_DIR, "codemirror-basic-setup", "src", "codemirror.ts");
  let setupContent = await readFile(setupSrc, "utf-8");
  setupContent = rewriteImports(setupContent, "setup.ts");
  await writeFile(join(SRC_DIR, "setup.ts"), setupContent, "utf-8");
  console.log("  codemirror/basic-setup -> src/setup.ts");

  // 8. Copy legacy modes
  console.log("\n--- Legacy Modes ---");
  const legacyDir = join(UPSTREAM_DIR, "codemirror-legacy-modes", "mode");
  const legacyDest = join(SRC_DIR, "lang", "legacy");
  await mkdir(legacyDest, { recursive: true });
  const legacyEntries = await readdir(legacyDir);
  let legacyCount = 0;
  for (const entry of legacyEntries) {
    if (entry.endsWith(".js") || entry.endsWith(".ts") || entry.endsWith(".d.ts")) {
      let content = await readFile(join(legacyDir, entry), "utf-8");
      const fileRelPath = posix.join("lang/legacy", entry);
      content = rewriteImports(content, fileRelPath);
      // Convert .js to .ts if it's a source file (not .d.ts)
      const destName = entry.endsWith(".d.ts") ? entry : entry;
      await writeFile(join(legacyDest, destName), content, "utf-8");
      legacyCount++;
    }
  }
  console.log(`  ${legacyCount} legacy mode files -> src/lang/legacy/`);

  // 9. Generate UPSTREAM.md
  console.log("\n--- Generating UPSTREAM.md ---");
  let upstream = `# Upstream Sync Tracking\n\nLast full sync: 2026-03-19\n\n`;
  upstream += `| Module | Upstream Repo | Upstream SHA | Synced Date |\n`;
  upstream += `|--------|---------------|--------------|-------------|\n`;
  for (const entry of upstreamTracking) {
    upstream += `| ${entry.module} | ${entry.repo} | ${entry.sha} | 2026-03-19 |\n`;
  }
  await writeFile(join(PROJECT_ROOT, "UPSTREAM.md"), upstream, "utf-8");
  console.log("  UPSTREAM.md written");

  console.log("\n=== Collapse complete! ===");
  console.log(`  Modules: ${upstreamTracking.length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
