/**
 * Build documentation site for GitHub Pages.
 * Generates a static site from docs/ and package metadata into docs-dist/.
 */
import { readFileSync, mkdirSync, writeFileSync, cpSync, existsSync } from "fs";
import { join } from "path";

const root = join(import.meta.dir, "..");
const outDir = join(root, "docs-dist");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf-8"));
const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf-8");
const readme = readFileSync(join(root, "README.md"), "utf-8");

// Collect export paths
const exports = Object.keys(pkg.exports).filter((e) => e !== ".");
const langExports = exports.filter((e) => e.startsWith("./lang/"));
const coreExports = exports.filter(
  (e) =>
    !e.startsWith("./lang/") &&
    !e.startsWith("./parser/") &&
    !e.startsWith("./theme/") &&
    !e.startsWith("./keymaps/") &&
    e !== "./setup",
);
const parserExports = exports.filter((e) => e.startsWith("./parser/"));
const themeExports = exports.filter((e) => e.startsWith("./theme/"));
const keymapExports = exports.filter((e) => e.startsWith("./keymaps/"));

function renderExportList(paths: string[], heading: string): string {
  return `<h3>${heading}</h3><ul>${paths.map((p) => `<li><code>${pkg.name}/${p.slice(2)}</code></li>`).join("\n")}</ul>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pkg.name} — Documentation</title>
  <style>
    :root {
      --bg: #0d1117;
      --fg: #c9d1d9;
      --accent: #58a6ff;
      --border: #30363d;
      --surface: #161b22;
      --code-bg: #1c2128;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--fg);
      line-height: 1.6;
      padding: 2rem;
      max-width: 960px;
      margin: 0 auto;
    }
    h1 { color: var(--accent); margin-bottom: 0.5rem; font-size: 2rem; }
    h2 { color: var(--accent); margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; }
    h3 { color: var(--fg); margin-top: 1.5rem; margin-bottom: 0.5rem; }
    p { margin-bottom: 1rem; }
    code {
      background: var(--code-bg);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.9em;
    }
    pre {
      background: var(--code-bg);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      margin-bottom: 1rem;
    }
    pre code { background: none; padding: 0; }
    ul { padding-left: 1.5rem; margin-bottom: 1rem; }
    li { margin-bottom: 0.25rem; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .badge {
      display: inline-block;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.85rem;
      margin-right: 0.5rem;
    }
    .section { margin-bottom: 2rem; }
  </style>
</head>
<body>
  <h1>${pkg.name}</h1>
  <p>${pkg.description}</p>
  <p>
    <span class="badge">v${pkg.version}</span>
    <span class="badge">MIT License</span>
    <span class="badge">Zero Dependencies</span>
  </p>

  <h2>Installation</h2>
  <pre><code>npm install ${pkg.name}</code></pre>

  <h2>Quick Start</h2>
  <pre><code>import { EditorState } from "${pkg.name}/state";
import { EditorView } from "${pkg.name}/view";
import { basicSetup } from "${pkg.name}/setup";
import { javascript } from "${pkg.name}/lang/javascript";

new EditorView({
  state: EditorState.create({
    doc: "console.log('Hello!');",
    extensions: [basicSetup, javascript()],
  }),
  parent: document.getElementById("editor"),
});</code></pre>

  <h2>Exports</h2>
  <div class="section">
    ${renderExportList(coreExports, "Core")}
    ${renderExportList(parserExports, "Parser")}
    ${renderExportList(langExports, "Languages")}
    ${renderExportList(themeExports, "Themes")}
    ${renderExportList(keymapExports, "Keymaps")}
    <h3>Setup</h3>
    <ul><li><code>${pkg.name}/setup</code></li></ul>
  </div>

  <h2>Changelog</h2>
  <div class="section">
    ${changelog
      .split("\n")
      .map((line) => {
        if (line.startsWith("# ")) return `<h3>${line.slice(2)}</h3>`;
        if (line.startsWith("## ")) return `<h3>${line.slice(3)}</h3>`;
        if (line.startsWith("### ")) return `<h4>${line.slice(4)}</h4>`;
        if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`;
        if (line.trim() === "") return "";
        return `<p>${line}</p>`;
      })
      .join("\n")}
  </div>

  <h2>Links</h2>
  <ul>
    <li><a href="${pkg.repository.url.replace(".git", "")}">GitHub Repository</a></li>
    <li><a href="https://www.npmjs.com/package/${pkg.name}">npm Package</a></li>
  </ul>
</body>
</html>`;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), html);

console.log(`✓ Docs built to docs-dist/`);
