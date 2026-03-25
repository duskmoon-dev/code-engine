#!/usr/bin/env bun
/**
 * Main build script for @duskmoon-dev/code-engine
 *
 * 1. Type check
 * 2. Build with Bun bundler (each subpath export as entry point)
 * 3. Generate .d.ts files
 * 4. Verify exports
 */

import { $ } from "bun";
import { join } from "path";

const ROOT = join(import.meta.dir, "..");

// All entry points matching the exports map in package.json
const entrypoints = [
  "src/index.ts",
  "src/core/state/index.ts",
  "src/core/view/index.ts",
  "src/core/language/index.ts",
  "src/core/commands/index.ts",
  "src/core/search/index.ts",
  "src/core/autocomplete/index.ts",
  "src/core/lint/index.ts",
  "src/core/collab/index.ts",
  "src/core/merge/index.ts",
  "src/core/lsp/index.ts",
  "src/core/language-data/index.ts",
  "src/parser/common/index.ts",
  "src/parser/lr/index.ts",
  "src/parser/highlight/index.ts",
  "src/lang/javascript/index.ts",
  "src/lang/python/index.ts",
  "src/lang/html/index.ts",
  "src/lang/css/index.ts",
  "src/lang/json/index.ts",
  "src/lang/markdown/index.ts",
  "src/lang/xml/index.ts",
  "src/lang/sql/index.ts",
  "src/lang/rust/index.ts",
  "src/lang/go/index.ts",
  "src/lang/java/index.ts",
  "src/lang/cpp/index.ts",
  "src/lang/php/index.ts",
  "src/lang/sass/index.ts",
  "src/lang/less/index.ts",
  "src/lang/yaml/index.ts",
  "src/lang/angular/index.ts",
  "src/lang/vue/index.ts",
  "src/lang/liquid/index.ts",
  "src/lang/wast/index.ts",
  "src/lang/jinja/index.ts",
  "src/lang/lezer/index.ts",
  "src/lang/legacy/index.ts",
  "src/theme/one-dark.ts",
  "src/theme/duskmoon.ts",
  "src/setup.ts",
  "src/keymaps/vim/index.ts",
  "src/keymaps/emacs/index.ts",
].map(p => join(ROOT, p));

async function main() {
  const start = performance.now();

  // 1. Type check
  console.log("Step 1: Type checking...");
  const tc = Bun.spawnSync(["bunx", "tsc", "--noEmit"], { cwd: ROOT, stdout: "inherit", stderr: "inherit" });
  if (tc.exitCode !== 0) {
    console.error("Type check failed!");
    process.exit(1);
  }
  console.log("  ✓ Type check passed\n");

  // 2. Clean dist
  console.log("Step 2: Cleaning dist/...");
  await $`rm -rf ${join(ROOT, "dist")}`;
  console.log("  ✓ Cleaned\n");

  // 3. Build with Bun
  console.log("Step 3: Building with Bun bundler...");
  const result = await Bun.build({
    entrypoints,
    outdir: join(ROOT, "dist"),
    root: join(ROOT, "src"),
    target: "browser",
    splitting: true,
    sourcemap: "external",
    minify: false,
    format: "esm",
  });

  if (!result.success) {
    console.error("Build failed!");
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }
  console.log(`  ✓ Built ${result.outputs.length} files\n`);

  // 4. Generate .d.ts files
  console.log("Step 4: Generating declaration files...");
  const dts = Bun.spawnSync(
    ["bunx", "tsc", "-p", "tsconfig.build.json"],
    { cwd: ROOT, stdout: "inherit", stderr: "inherit" }
  );
  if (dts.exitCode !== 0) {
    console.error("Declaration generation failed!");
    process.exit(1);
  }
  console.log("  ✓ Declarations generated\n");

  // 5. Verify exports
  console.log("Step 5: Verifying exports...");
  const verify = Bun.spawnSync(["bun", "run", join(ROOT, "scripts/verify-exports.ts")], {
    cwd: ROOT, stdout: "inherit", stderr: "inherit"
  });
  if (verify.exitCode !== 0) {
    console.error("Export verification failed!");
    process.exit(1);
  }

  const elapsed = ((performance.now() - start) / 1000).toFixed(1);
  console.log(`\n✓ Build complete in ${elapsed}s`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
