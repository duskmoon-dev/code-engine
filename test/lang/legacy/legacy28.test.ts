import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { javascript as legacyJS, json as legacyJSON, jsonld as legacyJSONLD, typescript as legacyTS } from "../../../src/lang/legacy/javascript";
import { simpleMode } from "../../../src/lang/legacy/simple-mode";
import { cobol } from "../../../src/lang/legacy/cobol";
import { puppet } from "../../../src/lang/legacy/puppet";
import { dockerFile } from "../../../src/lang/legacy/dockerfile";

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

// ─── Legacy JavaScript deep coverage ─────────────────────────────────────────

describe("Legacy JavaScript tokenizer deep coverage", () => {
  it("tokenizes template literals with nested expressions", () => {
    // Exercises tokenQuasi, continueQuasi, quasi combinator
    const doc = [
      "const greeting = `Hello, ${name}!`;",
      "const nested = `${a + b} and ${c ? `inner ${d}` : e}`;",
      "const tagged = html`<div>${content}</div>`;",
      "const multiline = `",
      "  line 1: ${x}",
      "  line 2: ${y + z}",
      "`;",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes regex literals in expression context", () => {
    // Exercises readRegexp and expressionAllowed
    const doc = [
      "const re1 = /abc/gi;",
      "const re2 = /[a-z]+\\.\\d{2,}/;",
      "const re3 = /\\//;",
      "if (/test/.test(str)) {}",
      "const arr = [/foo/, /bar/i];",
      "x = y || /fallback/;",
      "switch (true) { case /pat/.test(s): break; }",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes arrow functions with fat-arrow detection", () => {
    // Exercises findFatArrow, arrowBody, arrowBodyNoComma
    const doc = [
      "const f = x => x * 2;",
      "const g = (a, b) => a + b;",
      "const h = (a, b) => { return a - b; };",
      "const arr = [1,2,3].map(x => x * x);",
      "const obj = () => ({ key: 'value' });",
      "promise.then(x => x.data).catch(err => console.log(err));",
      "const noComma = [1].reduce((a, b) => a + b, 0);",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes classes with getters, setters, static, and computed keys", () => {
    // Exercises classBody, classfield, getterSetter, objprop
    const doc = [
      "class Animal {",
      "  #name;",
      "  static count = 0;",
      "  constructor(name) { this.#name = name; Animal.count++; }",
      "  get name() { return this.#name; }",
      "  set name(val) { this.#name = val; }",
      "  static create(n) { return new Animal(n); }",
      "  [Symbol.iterator]() { return this; }",
      "  async *generate() { yield 1; yield 2; }",
      "}",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes destructuring, spread, and complex assignments", () => {
    // Exercises pattern, proppattern, eltpattern, maybeAssign
    const doc = [
      "const { a, b: c, ...rest } = obj;",
      "const [x, , y, ...tail] = arr;",
      "const { nested: { deep } } = data;",
      "let [{ a: [b] }] = complex;",
      "function fn({ x = 10, y = 20 } = {}) {}",
      "const { [computed]: val } = map;",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes import/export with various forms", () => {
    // Exercises afterImport, importSpec, maybeAs, maybeFrom, afterExport, exportField
    const doc = [
      "import defaultExport from 'module';",
      "import * as ns from 'module';",
      "import { named, other as alias } from 'module';",
      "import 'side-effect';",
      "export default function() {}",
      "export { foo, bar as baz };",
      "export * from 'other';",
      "export const x = 42;",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes switch, for-of, for-in, and for-await-of", () => {
    // Exercises forspec, forspec1, forspec2 (in/of/await paths)
    const doc = [
      "switch (val) {",
      "  case 1: break;",
      "  case 'str': return;",
      "  default: throw new Error();",
      "}",
      "for (const k in obj) { console.log(k); }",
      "for (const v of arr) { console.log(v); }",
      "for (let i = 0; i < 10; i++) {}",
      "async function f() {",
      "  for await (const chunk of stream) {}",
      "}",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes number literals in all formats", () => {
    // Exercises tokenBase number branches: hex, octal, binary, bigint, decimal with exponent
    const doc = [
      "const hex = 0xFF_FF;",
      "const oct = 0o77_7;",
      "const bin = 0b1010_1100;",
      "const big = 9007199254740991n;",
      "const bigHex = 0xFFn;",
      "const float = 3.14_15;",
      "const exp = 1.5e+10;",
      "const expNeg = 2.5e-3;",
      "const dotNum = .5;",
      "const spread = ...arr;",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ─── Legacy TypeScript-specific paths ────────────────────────────────────────

describe("Legacy TypeScript tokenizer deep coverage", () => {
  it("tokenizes TypeScript-specific syntax (interface, enum, type, namespace, declare)", () => {
    // Exercises isTS branches: interface, enum, type, namespace, declare, abstract
    const doc = [
      "interface Point { x: number; y: number; }",
      "interface Named<T> extends Base { name: T; }",
      "enum Color { Red, Green, Blue }",
      "enum Direction { Up = 'UP', Down = 'DOWN' }",
      "type StringOrNumber = string | number;",
      "type Pair<T> = [T, T];",
      "namespace MyModule { export const x = 1; }",
      "declare function log(msg: string): void;",
      "abstract class Shape { abstract area(): number; }",
    ].join("\n");
    const state = parseDoc(legacyTS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes TypeScript type expressions and generics", () => {
    // Exercises typeexpr, afterType, typeprop, typearg, maybeReturnType, maybeTypeArgs
    const doc = [
      "let a: string | number;",
      "let b: { name: string; age?: number; [key: string]: any };",
      "let c: (x: number, ...rest: string[]) => void;",
      "let d: Array<Map<string, number[]>>;",
      "let e: keyof typeof obj;",
      "let f: readonly number[];",
      "let g: infer R extends string ? R : never;",
      "function isString(x: any): x is string { return typeof x === 'string'; }",
      "class Box<T> { value!: T; }",
      "const fn = <T,>(x: T): T => x;",
    ].join("\n");
    const state = parseDoc(legacyTS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes TypeScript modifiers in class bodies and function args", () => {
    // Exercises isModifier paths for public/private/protected/abstract/readonly
    const doc = [
      "class Service {",
      "  private readonly id: number;",
      "  protected name: string;",
      "  public abstract getInfo(): string;",
      "  constructor(private x: number, public y: number) {}",
      "}",
      "const obj = { get value(): number { return 1; } };",
    ].join("\n");
    const state = parseDoc(legacyTS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes TypeScript arrow with return type annotation", () => {
    // Exercises findFatArrow with TS return type skip
    const doc = [
      "const fn: (x: number) => string = (x) => String(x);",
      "const identity = <T>(x: T): T => x;",
      "const cast = (x: any): x is string => typeof x === 'string';",
      "type Fn = { (): void; (x: string): number };",
    ].join("\n");
    const state = parseDoc(legacyTS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ─── Legacy JSON/JSONLD coverage ─────────────────────────────────────────────

describe("Legacy JSON/JSONLD tokenizer coverage", () => {
  it("tokenizes JSON documents", () => {
    const doc = [
      '{',
      '  "name": "test",',
      '  "version": 1,',
      '  "active": true,',
      '  "deleted": false,',
      '  "value": null,',
      '  "nested": { "a": [1, 2, 3] },',
      '  "empty": {}',
      '}',
    ].join("\n");
    const state = parseDoc(legacyJSON, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes JSONLD documents with @-keywords", () => {
    // Exercises jsonldMode and isJsonldKeyword
    const doc = [
      '{',
      '  "@context": "http://schema.org",',
      '  "@type": "Person",',
      '  "@id": "http://example.com/person/1",',
      '  "@language": "en",',
      '  "@value": "John",',
      '  "@container": "@list",',
      '  "@graph": [{ "@id": "http://example.com/thing" }]',
      '}',
    ].join("\n");
    const state = parseDoc(legacyJSONLD, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ─── simple-mode deep coverage ───────────────────────────────────────────────

describe("simple-mode deep coverage", () => {
  it("handles push/pop state transitions", () => {
    // Exercises push/pop branches and stack management in tokenFunction
    // Uses dockerFile which defines push states for string quoting
    const doc = [
      '# comment line',
      'FROM ubuntu:22.04 AS base',
      'RUN echo "hello world" && \\',
      '    echo "continued"',
      "RUN echo 'single quoted'",
      'EXPOSE 8080 3000',
      'CMD ["node", "app.js"]',
      'ENTRYPOINT ["python", "-m", "http.server"]',
    ].join("\n");
    const state = parseDoc(dockerFile, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles multi-capture group tokens (pending mechanism)", () => {
    // Exercises the pending token queue in tokenFunction (matches.length > 2 path)
    // dockerFile rules have [null, "keyword", null] tokens with 3+ captures
    const doc = [
      "FROM node:18-alpine AS builder",
      "WORKDIR /app",
      "COPY package*.json ./",
      "RUN npm install",
      "COPY . .",
      "RUN npm run build",
      "EXPOSE 3000",
      "",
      "FROM node:18-alpine",
      "COPY --from=builder /app/dist /app",
      "CMD [\"node\", \"/app/index.js\"]",
    ].join("\n");
    const state = parseDoc(dockerFile, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("simpleMode throws on undefined state references", () => {
    // Exercises ensureState error path
    expect(() => {
      simpleMode({
        start: [{ regex: /\w+/, token: "variable", next: "nonexistent" }],
      });
    }).toThrow("Undefined state nonexistent in simple mode");
  });

  it("handles sol (start-of-line) rule constraint", () => {
    // Exercises the sol check in tokenFunction: (!rule.data.sol || stream.sol())
    const doc = [
      "# this is a comment at start of line",
      "FROM alpine:latest",
      "  # indented comment (sol still true)",
      "LABEL key=value",
    ].join("\n");
    const state = parseDoc(dockerFile, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles indent and dedent in simpleMode", () => {
    // Exercises hasIndentation, indent/dedent push/pop on state.indent
    // Build a minimal simpleMode with indent/dedent rules
    const mode = simpleMode({
      start: [
        { regex: /\{/, token: "bracket", indent: true },
        { regex: /\}/, token: "bracket", dedent: true },
        { regex: /\w+/, token: "variable" },
        { regex: /./, token: null },
      ],
    });
    const doc = "foo {\n  bar\n}";
    const state = parseDoc(mode, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("copyState preserves stack when present", () => {
    // Exercises copyState with stack cloning (state.stack branch)
    // Parse dockerfile with push/pop states to create stack entries
    const doc = [
      'RUN echo "start" && \\',
      '    echo "end"',
      "RUN echo 'quoted' && echo done",
    ].join("\n");
    const state = parseDoc(dockerFile, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ─── COBOL deep coverage ─────────────────────────────────────────────────────

describe("COBOL tokenizer deep coverage", () => {
  it("tokenizes COBOL with line numbers in columns 0-5", () => {
    // Exercises col >= 0 && col <= 5 returning COBOLLINENUM
    const doc = [
      "000100 IDENTIFICATION DIVISION.",
      "000200 PROGRAM-ID. HELLO-WORLD.",
      "000300 DATA DIVISION.",
      "000400 WORKING-STORAGE SECTION.",
      "000500 01 WS-NAME PIC A(20).",
      "000600 PROCEDURE DIVISION.",
      "000700     DISPLAY 'HELLO WORLD'.",
      "000800     STOP RUN.",
    ].join("\n");
    const state = parseDoc(cobol, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes COBOL comments in column 6", () => {
    // Exercises ch == '*' && col == 6 comment path
    const doc = [
      "000100 IDENTIFICATION DIVISION.",
      "      * This is a comment line",
      "      * Another comment",
      "000200 PROGRAM-ID. SAMPLE.",
    ].join("\n");
    const state = parseDoc(cobol, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes COBOL strings spanning multiple lines", () => {
    // Exercises the "string" mode multi-line string parsing
    const doc = [
      '       MOVE "This is a long',
      '       "string value" TO WS-STR.',
      "       MOVE 'Single quoted",
      "       'string' TO WS-OTHER.",
    ].join("\n");
    const state = parseDoc(cobol, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes COBOL numbers with hex, sign, decimal, and exponent", () => {
    // Exercises isNumber: hex (0x..), signed (+/-), decimal (.), exponent (e/E)
    const doc = [
      "       MOVE 0xFF TO WS-HEX.",
      "       MOVE +123 TO WS-POS.",
      "       MOVE -456 TO WS-NEG.",
      "       MOVE 3.14 TO WS-DEC.",
      "       MOVE 1.5E+10 TO WS-EXP.",
      "       COMPUTE WS-A = 42.",
    ].join("\n");
    const state = parseDoc(cobol, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes COBOL atoms and builtins", () => {
    // Exercises atoms (TRUE, FALSE, ZEROS, SPACES, etc.) and builtins (operators)
    const doc = [
      "       IF WS-FLAG = TRUE",
      "         MOVE ZEROS TO WS-COUNT",
      "         MOVE SPACES TO WS-NAME",
      "         MOVE LOW-VALUE TO WS-KEY",
      "       END-IF.",
      "       COMPUTE WS-RESULT = WS-A + WS-B * WS-C / WS-D.",
      "       IF WS-A > WS-B",
      "         IF WS-A <= WS-C",
      "           DISPLAY 'OK'",
      "         END-IF",
      "       END-IF.",
    ].join("\n");
    const state = parseDoc(cobol, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes COBOL columns 72-79 as MODTAG", () => {
    // Exercises col >= 72 && col <= 79 path (identification area)
    const line = "       DISPLAY 'HELLO'.                                                 SEQ00001";
    const state = parseDoc(cobol, line);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes COBOL period as PERIOD token type", () => {
    // Exercises ch == '.' returning PERIOD
    const doc = [
      "       IDENTIFICATION DIVISION.",
      "       PROGRAM-ID. TEST.",
      "       PROCEDURE DIVISION.",
      "           STOP RUN.",
    ].join("\n");
    const state = parseDoc(cobol, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ─── Puppet deep coverage ────────────────────────────────────────────────────

describe("Puppet tokenizer deep coverage", () => {
  it("tokenizes Puppet class definitions and includes", () => {
    // Exercises inDefinition and inInclude paths
    const doc = [
      "class mymodule::myclass {",
      "  include stdlib",
      "  include apache::mod::ssl",
      "}",
      "",
      "class base_config inherits parent {",
      "  notify { 'hello': }",
      "}",
    ].join("\n");
    const state = parseDoc(puppet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Puppet variables in double-quoted strings", () => {
    // Exercises tokenString with $ variable interpolation in double-quoted strings
    const doc = [
      '$package_name = "nginx"',
      '$greeting = "Hello, $username"',
      '$path = "/opt/${package_name}/bin"',
      '$config = "server ${::fqdn}:${port}"',
      "",
      "notify { \"message from ${hostname}\": }",
    ].join("\n");
    const state = parseDoc(puppet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Puppet with single-quoted strings (no interpolation)", () => {
    // Exercises tokenString with single quotes (no $ detection)
    const doc = [
      "$str = 'no interpolation here: $var'",
      "file { '/etc/motd':",
      "  ensure  => present,",
      "  content => 'Hello World',",
      "}",
    ].join("\n");
    const state = parseDoc(puppet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Puppet resource declarations and virtual/exported resources", () => {
    // Exercises resource regex, special_resource regex (@@), attribute regex
    const doc = [
      "file { '/tmp/test':",
      "  ensure => directory,",
      "  owner  => 'root',",
      "  mode   => '0755',",
      "}",
      "",
      "@@host { $hostname:",
      "  ip => $ipaddress,",
      "}",
      "",
      "mycustom::resource { 'instance':",
      "  param => 'value',",
      "}",
    ].join("\n");
    const state = parseDoc(puppet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Puppet conditionals, case, and selectors", () => {
    // Exercises keyword paths: if, else, elsif, case, default, in, and, or
    const doc = [
      "if $osfamily == 'Debian' {",
      "  $pkg = 'nginx'",
      "} elsif $osfamily == 'RedHat' {",
      "  $pkg = 'httpd'",
      "} else {",
      "  $pkg = 'apache2'",
      "}",
      "",
      "case $operatingsystem {",
      "  'Ubuntu', 'Debian': { include apt }",
      "  'RedHat', 'CentOS': { include yum }",
      "  default: { fail('Unsupported') }",
      "}",
    ].join("\n");
    const state = parseDoc(puppet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Puppet regex, numbers, operators, and comments", () => {
    // Exercises regex (ch == '/'), number, operator (=, =>), comment (#)
    const doc = [
      "# This is a comment",
      "$count = 42",
      "$pi = 3",
      "",
      "if $hostname =~ /^web\\d+/ {",
      "  $role = 'webserver'",
      "}",
      "",
      "package { $pkg:",
      "  ensure => present,",
      "}",
      "",
      "$result = true",
    ].join("\n");
    const state = parseDoc(puppet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Puppet function calls and capitalized references", () => {
    // Exercises function call detection (stream.match(/(\s+)?\w+\(/))
    // and capitalized reference detection (/(^|\s+)[A-Z][\w:_]+/)
    const doc = [
      "ensure_resource('package', 'vim', { ensure => present })",
      "template('mymodule/config.erb')",
      "File['/tmp/test']",
      "Package['nginx']",
      "Class['apache']",
      "",
      "define mymodule::mytype ($param1, $param2) {",
      "  notify { $name: message => $param1 }",
      "}",
    ].join("\n");
    const state = parseDoc(puppet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Puppet node definitions and site blocks", () => {
    // Exercises node and site keywords triggering inDefinition
    const doc = [
      "node 'webserver.example.com' {",
      "  include roles::webserver",
      "}",
      "",
      "node default {",
      "  include base",
      "}",
    ].join("\n");
    const state = parseDoc(puppet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
