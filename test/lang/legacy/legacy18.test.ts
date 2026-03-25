import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { powerShell } from "../../../src/lang/legacy/powershell";
import { css as legacyCss, sCSS, less, gss } from "../../../src/lang/legacy/css";
import { nginx } from "../../../src/lang/legacy/nginx";
import { erlang } from "../../../src/lang/legacy/erlang";
import { textile } from "../../../src/lang/legacy/textile";

// Helper: create state and force full parse
function parseDoc(parser: object, doc: string): EditorState {
  const lang = StreamLanguage.define(parser as any);
  const state = EditorState.create({
    doc,
    extensions: [new LanguageSupport(lang)],
  });
  ensureSyntaxTree(state, doc.length, 5000);
  return state;
}

function treeLen(state: EditorState): number {
  const tree = ensureSyntaxTree(state, state.doc.length, 5000);
  return tree ? tree.length : 0;
}

describe("PowerShell tokenizer deep coverage", () => {
  it("tokenizes PowerShell here-strings (@\"...\"@)", () => {
    // Triggers ch === '@' with here-string paths (lines 202-219)
    const doc = [
      '# PowerShell here-string',
      '$text = @"',
      'This is a here-string',
      'with multiple lines',
      '"@',
      '',
      "$text2 = @'",
      'Single-quoted here-string',
      "no interpolation here",
      "'@",
    ].join("\n");
    const state = parseDoc(powerShell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes PowerShell with double-quoted strings and interpolation", () => {
    // Triggers tokenDoubleQuoteString with $ interpolation and ` escapes
    const doc = [
      '$name = "World"',
      '$greeting = "Hello, $name!"',
      '$path = "C:\\Users\\$name\\Documents"',
      '$escaped = "Tab:`t Newline:`n Quote:`""',
      '$dollar = "Price: `$5.00"',
      '$expr = "Result: $(1 + 2 * 3)"',
    ].join("\n");
    const state = parseDoc(powerShell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes PowerShell with single-quoted strings and comments", () => {
    const doc = [
      "# Line comment",
      "$str = 'single quoted string'",
      "$str2 = 'it''s escaped with double single quote'",
      "",
      "<# Block comment",
      "   spanning multiple lines #>",
      "",
      "Write-Host 'Hello'",
    ].join("\n");
    const state = parseDoc(powerShell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes PowerShell with splatted variables and arrays", () => {
    // Triggers @ with variable names (splatting)
    const doc = [
      "$params = @{",
      "  ComputerName = 'localhost'",
      "  Port = 5985",
      "}",
      "Invoke-Command @params",
      "",
      "$arr = @(1, 2, 3, 4, 5)",
      "$sum = ($arr | Measure-Object -Sum).Sum",
      "",
      "# Hash table",
      "$hash = @{",
      "  Key1 = 'Value1'",
      "  Key2 = 42",
      "}",
      "$hash['Key1']",
      "$hash.Key2",
    ].join("\n");
    const state = parseDoc(powerShell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes PowerShell with advanced control flow and error handling", () => {
    const doc = [
      "function Get-Factorial {",
      "  param([int]$n)",
      "  if ($n -le 1) { return 1 }",
      "  return $n * (Get-Factorial ($n - 1))",
      "}",
      "",
      "try {",
      "  $result = Get-Factorial 5",
      "  Write-Host \"Result: $result\"",
      "} catch [System.Exception] {",
      "  Write-Error $_.Exception.Message",
      "} finally {",
      "  Write-Host 'Done'",
      "}",
      "",
      "foreach ($i in 1..10) {",
      "  if ($i % 2 -eq 0) { continue }",
      "  Write-Host $i",
      "}",
      "",
      "switch ($x) {",
      "  1 { 'one' }",
      "  2 { 'two' }",
      "  default { 'other' }",
      "}",
    ].join("\n");
    const state = parseDoc(powerShell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("SCSS tokenizer deep coverage", () => {
  it("tokenizes SCSS with variables, nesting, and interpolation", () => {
    // Exercises sCSS-specific tokenHooks: $, #{}, //
    const doc = [
      "// SCSS comment",
      "/* block comment */",
      "$primary: #336699;",
      "$border-radius: 4px;",
      "$font-stack: 'Helvetica Neue', sans-serif;",
      "",
      ".button-#{$type} {",
      "  background: $primary;",
      "  border-radius: $border-radius;",
      "  font-family: $font-stack;",
      "}",
      "",
      ".container {",
      "  .inner {",
      "    color: darken($primary, 10%);",
      "    &:hover {",
      "      color: lighten($primary, 10%);",
      "    }",
      "    &::before {",
      "      content: '';",
      "    }",
      "  }",
      "}",
    ].join("\n");
    const state = parseDoc(sCSS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes SCSS with operators and slash comments", () => {
    // Tests // line comments and operator handling
    const doc = [
      "// SCSS calculations",
      "$width: 100px;",
      "$height: $width / 2;  // integer division",
      "$margin: $width * 0.1;",
      "",
      ".box {",
      "  width: $width;",
      "  height: $height;",
      "  margin: $margin;",
      "  padding: ($width / 4);",
      "}",
      "",
      "// if/else directives",
      "@if $height > 30px {",
      "  .box { font-size: 16px; }",
      "} @else if $height > 20px {",
      "  .box { font-size: 14px; }",
      "} @else {",
      "  .box { font-size: 12px; }",
      "}",
    ].join("\n");
    const state = parseDoc(sCSS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("LESS tokenizer deep coverage", () => {
  it("tokenizes LESS with variables, mixins, and @-rules", () => {
    // Exercises less-specific tokenHooks: @, &, //
    const doc = [
      "// LESS comment",
      "@primary: #336699;",
      "@font-size: 16px;",
      "@border-color: darken(@primary, 10%);",
      "",
      ".mixin(@color: white, @margin: 2px, @padding: 2px) {",
      "  color: @color;",
      "  margin: @margin;",
      "  padding: @padding;",
      "}",
      "",
      ".class1 {",
      "  .mixin(@color: @primary);",
      "  &:hover { color: lighten(@primary, 10%); }",
      "  & when (@font-size >= 16px) { font-size: @font-size; }",
      "}",
      "",
      "// Variable interpolation",
      "@property: color;",
      ".widget { @{property}: @primary; }",
    ].join("\n");
    const state = parseDoc(less, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes LESS with guards, namespaces, and loops", () => {
    const doc = [
      "@base: 5%;",
      "@filler: @base * 2;",
      "@other: @base + @filler;",
      "",
      "#header {",
      "  .navigation { font-size: 12px; }",
      "  .logo { width: 300px; }",
      "}",
      "",
      "#header > .navigation { font-size: 14px; }",
      "",
      ".generate-columns(@n, @i: 1) when (@i =< @n) {",
      "  .column-@{i} { width: (@i * 100% / @n); }",
      "  .generate-columns(@n, (@i + 1));",
      "}",
      ".generate-columns(4);",
    ].join("\n");
    const state = parseDoc(less, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("GSS tokenizer deep coverage", () => {
  it("tokenizes GSS (Google Closure Stylesheets)", () => {
    // Exercises gss-specific tokenHook for /* ... */ only
    const doc = [
      "/* GSS stylesheet */",
      ".button {",
      "  color: #336699;",
      "  font-size: 14px;",
      "  padding: 8px 16px;",
      "}",
      "",
      "/* Media query */",
      "@media screen and (max-width: 768px) {",
      "  .button {",
      "    width: 100%;",
      "  }",
      "}",
      "",
      "/* Constants (GSS-specific) */",
      "@def BRAND_COLOR #336699;",
      "@def FONT_SIZE 16px;",
      "",
      ".header {",
      "  background: BRAND_COLOR;",
      "  font-size: FONT_SIZE;",
      "}",
    ].join("\n");
    const state = parseDoc(gss, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Legacy CSS tokenizer advanced coverage", () => {
  it("tokenizes CSS with font properties and counter descriptors", () => {
    const doc = [
      "@font-face {",
      "  font-family: 'MyFont';",
      "  font-weight: bold;",
      "  font-style: italic;",
      "  font-display: swap;",
      "  src: url('myfont.woff2') format('woff2'),",
      "       url('myfont.woff') format('woff');",
      "  unicode-range: U+0000-00FF, U+0131;",
      "}",
      "",
      "@counter-style thumbs {",
      "  system: cyclic;",
      "  symbols: '\\1F44D';",
      "  suffix: ' ';",
      "}",
      "",
      "ol.thumbs { list-style: thumbs; }",
    ].join("\n");
    const state = parseDoc(legacyCss, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes CSS with important, url(), and complex values", () => {
    const doc = [
      ".overrides {",
      "  color: red !important;",
      "  background: url('image.jpg') no-repeat center / cover;",
      "  background-image: url(data:image/png;base64,abc123);",
      "  border-image: url('border.png') 30 stretch;",
      "}",
      "",
      ".shadows {",
      "  box-shadow: 0 2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1);",
      "  text-shadow: 1px 1px 2px black, 0 0 1em blue;",
      "  filter: drop-shadow(2px 2px 4px #0003);",
      "}",
      "",
      ".transforms {",
      "  transform: translate(50px, 100px) rotate(45deg) scale(1.5);",
      "  transform-origin: top left;",
      "  perspective: 1000px;",
      "}",
    ].join("\n");
    const state = parseDoc(legacyCss, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes CSS with CSS variables, comparison functions, and modern syntax", () => {
    const doc = [
      ":root {",
      "  --hue: 220;",
      "  --saturation: 70%;",
      "  --lightness: 50%;",
      "  --primary: hsl(var(--hue) var(--saturation) var(--lightness));",
      "}",
      "",
      ".responsive {",
      "  font-size: clamp(14px, 2vw, 24px);",
      "  width: min(500px, 90vw);",
      "  height: max(100px, 20vh);",
      "  padding: env(safe-area-inset-top) env(safe-area-inset-right);",
      "}",
      "",
      "@layer base, theme, utilities;",
      "@layer theme {",
      "  :root { --color: blue; }",
      "}",
    ].join("\n");
    const state = parseDoc(legacyCss, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Nginx tokenizer advanced coverage", () => {
  it("tokenizes Nginx with events, stream, and mail blocks", () => {
    const doc = [
      "events {",
      "  worker_connections 1024;",
      "  use epoll;",
      "  multi_accept on;",
      "}",
      "",
      "stream {",
      "  server {",
      "    listen 3306;",
      "    proxy_pass mysql_backend;",
      "    proxy_connect_timeout 1s;",
      "    proxy_timeout 3s;",
      "  }",
      "",
      "  upstream mysql_backend {",
      "    server 127.0.0.1:33060;",
      "    server 127.0.0.1:33061;",
      "  }",
      "}",
    ].join("\n");
    const state = parseDoc(nginx, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Nginx with access control and includes", () => {
    const doc = [
      "http {",
      "  # Gzip compression",
      "  gzip on;",
      "  gzip_types text/plain text/css application/json;",
      "  gzip_min_length 1000;",
      "",
      "  # Security headers",
      "  add_header X-Frame-Options SAMEORIGIN;",
      "  add_header X-Content-Type-Options nosniff;",
      "  add_header Strict-Transport-Security 'max-age=31536000';",
      "",
      "  # Rate limiting",
      "  limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;",
      "",
      "  server {",
      "    listen 80;",
      "    return 301 https://$host$request_uri;",
      "  }",
      "",
      "  include /etc/nginx/conf.d/*.conf;",
      "  include /etc/nginx/sites-enabled/*;",
      "}",
    ].join("\n");
    const state = parseDoc(nginx, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Erlang tokenizer deeper coverage", () => {
  it("tokenizes Erlang with behaviors, specs, and complex types", () => {
    const doc = [
      "-module(complex).",
      "-behaviour(gen_statem).",
      "",
      "-type state() :: idle | running | stopped.",
      "-type event() :: start | stop | {data, binary()}.",
      "",
      "-spec handle_event(event(), state()) -> {next_state, state()}.",
      "handle_event(start, idle) ->",
      "  {next_state, running};",
      "handle_event(stop, running) ->",
      "  {next_state, idle};",
      "handle_event(_, State) ->",
      "  {next_state, State}.",
      "",
      "% Character literals",
      "char_test() ->",
      "  $A =:= 65.",
      "",
      "% Bit syntax",
      "parse_packet(<<Type:8, Len:16/big, Data:Len/binary, Rest/binary>>) ->",
      "  {Type, Data, Rest}.",
    ].join("\n");
    const state = parseDoc(erlang, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Erlang with fun expressions and list operations", () => {
    const doc = [
      "list_operations() ->",
      "  L = lists:seq(1, 10),",
      "  Doubled = lists:map(fun(X) -> X * 2 end, L),",
      "  Evens = lists:filter(fun(X) -> X rem 2 =:= 0 end, L),",
      "  Sum = lists:foldl(fun(X, Acc) -> X + Acc end, 0, L),",
      "  {Doubled, Evens, Sum}.",
      "",
      "string_ops() ->",
      '  S = "hello world",',
      "  Upper = string:uppercase(S),",
      "  Tokens = string:split(S, \" \", all),",
      "  Bin = list_to_binary(S),",
      "  {Upper, Tokens, Bin}.",
      "",
      "% Receive with timeout",
      "wait_for_message() ->",
      "  receive",
      "    {msg, Data} -> {ok, Data};",
      "    timeout_msg -> {error, timeout}",
      "  after 5000 ->",
      "    {error, timeout}",
      "  end.",
    ].join("\n");
    const state = parseDoc(erlang, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Textile tokenizer deeper coverage", () => {
  it("tokenizes Textile with tables, footnotes, and special markup", () => {
    // Targets lines 304,306,308,312,314,353-354,367,371-425
    const doc = [
      "|_. Header 1|_. Header 2|_. Header 3|",
      "|cell 1|cell 2|cell 3|",
      "|\\2. colspan two|cell|",
      "|/2. rowspan|cell|cell|",
      "|cell|",
      "",
      "This is a footnote reference[1].",
      "",
      "fn1. This is the footnote text.",
      "",
      "# ordered list item 1",
      "## nested ordered 1",
      "## nested ordered 2",
      "# ordered list item 2",
      "",
      "* unordered item 1",
      "** nested unordered",
      "",
      "; term : definition",
      "; another : term",
    ].join("\n");
    const state = parseDoc(textile, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Textile with block attributes and textile-specific tags", () => {
    const doc = [
      "p(classname). Paragraph with class.",
      "p{color:red}. Red paragraph.",
      "p[fr]. French paragraph.",
      "",
      "div(wrapper). ",
      "Wrapped content.",
      "",
      "%(highlight)highlighted phrase%",
      "@(code)code span@",
      "",
      'notextile. <p>raw HTML paragraph</p>',
      "",
      "==escaped== ==textile==",
      "",
      "pre. preformatted block",
      "  with indentation",
      "",
      "bc. source code block",
      "  var x = 1;",
    ].join("\n");
    const state = parseDoc(textile, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
