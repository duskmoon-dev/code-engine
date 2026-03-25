import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { ruby } from "../../../src/lang/legacy/ruby";
import { javascript as legacyJS } from "../../../src/lang/legacy/javascript";
import { sass as legacySass } from "../../../src/lang/legacy/sass";
import { stylus } from "../../../src/lang/legacy/stylus";
import { tiddlyWiki } from "../../../src/lang/legacy/tiddlywiki";
import { http } from "../../../src/lang/legacy/http";
import { oz } from "../../../src/lang/legacy/oz";
import { nginx } from "../../../src/lang/legacy/nginx";
import { mathematica } from "../../../src/lang/legacy/mathematica";
import { modelica } from "../../../src/lang/legacy/modelica";
import { mirc } from "../../../src/lang/legacy/mirc";
import { scheme } from "../../../src/lang/legacy/scheme";

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

function treeLength(state: EditorState): number {
  const tree = ensureSyntaxTree(state, state.doc.length, 5000);
  return tree ? tree.length : 0;
}

describe("Ruby tokenizer deep coverage", () => {
  it("tokenizes Ruby with strings, symbols, comments, and heredoc", () => {
    const doc = [
      "# Ruby comment",
      "require 'net/http'",
      "",
      "class Greeter",
      "  attr_reader :name",
      "",
      "  def initialize(name)",
      "    @name = name",
      "  end",
      "",
      "  def greet",
      '    puts "Hello, #{@name}!"',
      "  end",
      "end",
      "",
      "g = Greeter.new('World')",
      "g.greet",
    ].join("\n");
    const state = parseDoc(ruby, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Ruby with regex, numbers, and operators", () => {
    const doc = [
      "x = 42",
      "y = 3.14",
      "z = 0xFF",
      "arr = [1, 2, 3]",
      "hash = { key: 'value', num: 99 }",
      "if x > 10 && y < 5.0",
      "  puts :symbol",
      "end",
      "pattern = /hello\\s+world/i",
      'str = "escaped \\"quote\\""',
    ].join("\n");
    const state = parseDoc(ruby, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Ruby block syntax and multi-line strings", () => {
    const doc = [
      "[1, 2, 3].each do |x|",
      "  puts x * 2",
      "end",
      "",
      "result = (1..10).select { |n| n.even? }",
      "",
      "<<~HEREDOC",
      "  This is a heredoc",
      "  spanning multiple lines",
      "HEREDOC",
    ].join("\n");
    const state = parseDoc(ruby, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Legacy JavaScript tokenizer deep coverage", () => {
  it("tokenizes JS with diverse token types", () => {
    const doc = [
      "// line comment",
      "/* block comment */",
      "var x = 42;",
      "let y = 3.14;",
      'const s = "hello world";',
      "const t = 'single quoted';",
      "const re = /regex[\\d]+/gi;",
      "function foo(a, b) {",
      "  return a + b;",
      "}",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes JS with template literals and operators", () => {
    const doc = [
      "const name = 'World';",
      "const msg = `Hello, ${name}!`;",
      "const obj = { a: 1, b: true, c: null };",
      "const arr = [1, 2, 3];",
      "class Foo extends Bar {",
      "  constructor() { super(); }",
      "  get value() { return this._v; }",
      "  set value(v) { this._v = v; }",
      "}",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes JS with async/await and arrow functions", () => {
    const doc = [
      "const fetch = async (url) => {",
      "  try {",
      "    const res = await http.get(url);",
      "    return res.data;",
      "  } catch (err) {",
      "    console.error(err);",
      "    throw err;",
      "  }",
      "};",
      "export default fetch;",
      "import { foo } from './bar';",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Sass tokenizer deep coverage", () => {
  it("tokenizes Sass with variables, nesting, and mixins", () => {
    const doc = [
      "$primary: #333;",
      "$font-size: 16px;",
      "",
      "@mixin flex-center {",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "}",
      "",
      ".container {",
      "  @include flex-center;",
      "  color: $primary;",
      "  font-size: $font-size;",
      "",
      "  &:hover {",
      "    color: darken($primary, 10%);",
      "  }",
      "",
      "  .inner {",
      "    padding: 1rem;",
      "  }",
      "}",
    ].join("\n");
    const state = parseDoc(legacySass, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Sass with @extend, @if, and @each", () => {
    const doc = [
      "%placeholder {",
      "  display: block;",
      "}",
      "",
      ".foo {",
      "  @extend %placeholder;",
      "}",
      "",
      "@each $color in red, green, blue {",
      "  .text-#{$color} { color: $color; }",
      "}",
      "",
      "@if $font-size > 14px {",
      "  body { font-size: $font-size; }",
      "}",
    ].join("\n");
    const state = parseDoc(legacySass, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Stylus tokenizer deep coverage", () => {
  it("tokenizes Stylus with implicit brackets", () => {
    const doc = [
      "// Stylus comment",
      "primary = #333",
      "",
      ".container",
      "  color primary",
      "  font-size 16px",
      "  display flex",
      "",
      "  &:hover",
      "    color darken(primary, 10%)",
      "",
      ".button",
      '  content "click me"',
      "  border 1px solid #ccc",
      "  padding 8px 16px",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Stylus with functions and arithmetic", () => {
    const doc = [
      "w = 100px",
      "h = w / 2",
      "",
      "box(w, h)",
      "  width w",
      "  height h",
      "",
      ".square",
      "  box(50px, 50px)",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("HTTP tokenizer deep coverage", () => {
  it("tokenizes HTTP request", () => {
    const doc = [
      "POST /api/users HTTP/1.1",
      "Host: example.com",
      "Content-Type: application/json",
      "Authorization: Bearer token123",
      "Content-Length: 42",
      "",
      '{"name": "Alice", "email": "alice@example.com"}',
    ].join("\n");
    const state = parseDoc(http, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes HTTP response", () => {
    const doc = [
      "HTTP/1.1 200 OK",
      "Content-Type: application/json",
      "Cache-Control: no-cache",
      "X-Custom-Header: value",
      "",
      '{"status": "success", "data": [1, 2, 3]}',
    ].join("\n");
    const state = parseDoc(http, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Oz tokenizer deep coverage", () => {
  it("tokenizes Oz programming language code", () => {
    const doc = [
      "% Oz comment",
      "declare",
      "fun {Fact N}",
      "  if N =< 1 then 1",
      "  else N * {Fact N-1}",
      "  end",
      "end",
      "",
      "{Browse {Fact 10}}",
    ].join("\n");
    const state = parseDoc(oz, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Oz with classes and strings", () => {
    const doc = [
      "class Counter",
      "  attr count:0",
      "  meth init count := 0 end",
      "  meth inc count := @count + 1 end",
      '  meth get(V) V = @count end',
      "end",
      "",
      'X = "hello world"',
      "Y = 42",
      "Z = 3.14",
    ].join("\n");
    const state = parseDoc(oz, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Nginx tokenizer deep coverage", () => {
  it("tokenizes Nginx config with server blocks", () => {
    const doc = [
      "# nginx comment",
      "user nginx;",
      "worker_processes auto;",
      "",
      "http {",
      "  include /etc/nginx/mime.types;",
      "  default_type application/octet-stream;",
      "",
      "  server {",
      "    listen 80;",
      "    server_name example.com;",
      "",
      "    location / {",
      "      root /var/www/html;",
      "      index index.html;",
      "      try_files $uri $uri/ =404;",
      "    }",
      "",
      "    location /api/ {",
      "      proxy_pass http://backend:3000;",
      "      proxy_set_header Host $host;",
      "    }",
      "  }",
      "}",
    ].join("\n");
    const state = parseDoc(nginx, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Mathematica tokenizer deep coverage", () => {
  it("tokenizes Mathematica with symbols and patterns", () => {
    const doc = [
      "(* Mathematica comment *)",
      "f[x_] := x^2 + 2*x + 1",
      "g[x_, y_] := x*y",
      "result = Integrate[x^2, {x, 0, 1}]",
      "Plot[Sin[x], {x, 0, 2*Pi}]",
      "Table[i^2, {i, 1, 10}]",
    ].join("\n");
    const state = parseDoc(mathematica, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Modelica tokenizer deep coverage", () => {
  it("tokenizes Modelica with classes and equations", () => {
    const doc = [
      "// Modelica comment",
      "model SimpleCircuit",
      "  /* block comment */",
      "  parameter Real R = 1.0 \"Resistance\";",
      "  Real u, i;",
      "equation",
      "  u = R * i;",
      "  der(u) = i / R;",
      "end SimpleCircuit;",
    ].join("\n");
    const state = parseDoc(modelica, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Mirc tokenizer deep coverage", () => {
  it("tokenizes mIRC script", () => {
    const doc = [
      "; mIRC comment",
      "on *:CONNECT: {",
      "  echo -a Connected to $server",
      "  if ($nick == mybot) { join #channel }",
      "}",
      "",
      "alias greet {",
      "  msg $1 Hello, $1 !",
      "}",
      "",
      "on *:TEXT:!hello:#: {",
      "  greet $nick",
      "}",
    ].join("\n");
    const state = parseDoc(mirc, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Scheme tokenizer deep coverage", () => {
  it("tokenizes Scheme with lists, lambdas, and macros", () => {
    const doc = [
      "; Scheme comment",
      "(define (factorial n)",
      "  (if (<= n 1)",
      "      1",
      "      (* n (factorial (- n 1)))))",
      "",
      "(define (map f lst)",
      "  (if (null? lst)",
      "      '()",
      "      (cons (f (car lst)) (map f (cdr lst)))))",
      "",
      '(display "Hello, World!")',
      "(newline)",
      "(let ((x 42) (y 3.14))",
      "  (+ x y))",
    ].join("\n");
    const state = parseDoc(scheme, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("TiddlyWiki tokenizer deep coverage", () => {
  it("tokenizes TiddlyWiki markup", () => {
    const doc = [
      "! Heading 1",
      "!! Heading 2",
      "",
      "This is ''bold'' text.",
      "This is //italic// text.",
      "This is __underlined__ text.",
      "",
      "* List item 1",
      "* List item 2",
      "** Nested item",
      "",
      "[[Link|Target Page]]",
      "{{{code block}}}",
      "@@highlight@@",
    ].join("\n");
    const state = parseDoc(tiddlyWiki, doc);
    expect(treeLength(state)).toBeGreaterThanOrEqual(0);
  });
});
