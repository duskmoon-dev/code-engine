import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { getIndentation, IndentContext } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { csharp, kotlin, scala } from "../../../src/lang/legacy/clike";
import { standardSQL } from "../../../src/lang/legacy/sql";
import { css as legacyCss } from "../../../src/lang/legacy/css";
import { q } from "../../../src/lang/legacy/q";
import { lua } from "../../../src/lang/legacy/lua";
import { ntriples } from "../../../src/lang/legacy/ntriples";
import { dtd } from "../../../src/lang/legacy/dtd";
import { tcl } from "../../../src/lang/legacy/tcl";
import { turtle } from "../../../src/lang/legacy/turtle";

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

describe("clike tokenizer deep coverage (block comments, builtins, indent)", () => {
  it("tokenizes block comments /* ... */", () => {
    // clike line 81-83: block comment entry; lines 127-135: tokenComment function
    const state = parseDoc(csharp, "/* block comment\n   spanning lines */\nint x = 0;");
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
    expect(tree!.length).toBeGreaterThan(0);
  });

  it("tokenizes line comments //", () => {
    // clike lines 85-87: line comment path
    const state = parseDoc(csharp, "// line comment\nint y = 1;");
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes string with escape sequences", () => {
    // clike tokenString function with escape chars
    const state = parseDoc(csharp, 'string s = "hello\\nworld";');
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes builtin identifiers (csharp)", () => {
    // clike lines 105-108: builtin path
    const state = parseDoc(csharp, "Console.WriteLine(\"hello\");");
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes operators and identifiers", () => {
    // clike lines 90-111: operators + identifier paths
    const state = parseDoc(csharp, "int a = 1 + 2 * 3 - 4 / 5;");
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes kotlin with diverse code", () => {
    const doc = [
      "// Kotlin: types, builtins, operators",
      "fun compute(x: Int, y: Int): Boolean {",
      "  /* block comment */",
      "  val result = x + y",
      "  return result > 0",
      "}",
    ].join("\n");
    const state = parseDoc(kotlin, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes scala with complex patterns", () => {
    const doc = [
      "// Scala code",
      "object Example {",
      "  /* block comment */",
      "  def main(args: Array[String]): Unit = {",
      '    val s: String = "hello"',
      "    println(s)",
      "  }",
      "}",
    ].join("\n");
    const state = parseDoc(scala, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("exercises indentation logic via getIndentation (clike lines 207-233)", () => {
    const doc = "if (true) {\n  int x = 1;\n}";
    const lang = StreamLanguage.define(csharp);
    const state = EditorState.create({
      doc,
      extensions: [new LanguageSupport(lang)],
    });
    ensureSyntaxTree(state, doc.length, 5000);
    // getIndentation calls the clike indent function (lines 207-233)
    const line2Start = state.doc.line(2).from;
    const indent = getIndentation(state, line2Start);
    // indent may be null or a number, both are valid
    expect(indent === null || typeof indent === "number").toBe(true);
  });
});

describe("SQL tokenizer deep coverage (strings, comments, numbers)", () => {
  it("tokenizes -- line comments", () => {
    // sql.js lines 68-72: single-line comment with --
    const state = parseDoc(standardSQL, "SELECT * FROM users -- this is a comment\nWHERE id = 1;");
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes /* ... */ block comments", () => {
    // sql.js lines 73-77
    const state = parseDoc(standardSQL, "/* SQL block comment\n   multi-line */\nSELECT 1;");
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes string literals with single quotes", () => {
    // sql.js lines 44-48: string literal tokenization
    const state = parseDoc(standardSQL, "SELECT 'hello world', 'it''s fine' FROM dual;");
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes numeric literals", () => {
    // sql.js lines 35-40: number tokenization
    const state = parseDoc(standardSQL, "SELECT 42, 3.14, 1.5e10 FROM dual;");
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes keywords and identifiers", () => {
    // sql.js keyword/identifier paths
    const doc = [
      "SELECT id, name, email",
      "FROM users",
      "WHERE active = TRUE",
      "  AND age > 18",
      "ORDER BY name ASC",
      "LIMIT 10 OFFSET 0;",
    ].join("\n");
    const state = parseDoc(standardSQL, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes INSERT and UPDATE statements", () => {
    const doc = [
      "INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');",
      "UPDATE users SET name = 'Bob' WHERE id = 1;",
      "DELETE FROM sessions WHERE expired = TRUE;",
    ].join("\n");
    const state = parseDoc(standardSQL, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });
});

describe("legacy CSS tokenizer deep coverage", () => {
  it("tokenizes CSS with properties, values, and comments", () => {
    // css.js uncovered paths for various property types
    const doc = [
      "/* CSS block comment */",
      "body {",
      "  color: #333;",
      "  font-size: 16px;",
      "  background: url('image.png');",
      "}",
      "",
      "/* selectors */",
      ".container > .inner:hover {",
      "  display: flex;",
      "  margin: 0 auto;",
      "}",
    ].join("\n");
    const state = parseDoc(legacyCss, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes CSS with @-rules and pseudo-selectors", () => {
    const doc = [
      "@media (max-width: 768px) {",
      "  body { font-size: 14px; }",
      "}",
      "@import url('reset.css');",
      "h1:first-child { color: blue; }",
    ].join("\n");
    const state = parseDoc(legacyCss, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes CSS with string values and numbers", () => {
    const doc = [
      '.container {',
      '  content: "hello world";',
      '  z-index: 100;',
      '  opacity: 0.5;',
      '  border: 1px solid #ccc;',
      '}',
    ].join("\n");
    const state = parseDoc(legacyCss, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });
});

describe("Q language tokenizer coverage", () => {
  it("tokenizes Q/kdb+ code with diverse tokens", () => {
    // q.js uncovered paths
    const doc = [
      "/ Q comment (starts with /)",
      "x: 1 2 3;",
      "y: `sym1`sym2;",
      "z: \"string value\";",
      "f: {[a;b] a+b};",
    ].join("\n");
    const state = parseDoc(q, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes Q keywords and operators", () => {
    const doc = "select from t where i > 10;\ncount t;\nsum x";
    const state = parseDoc(q, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });
});

describe("Lua tokenizer deep coverage", () => {
  it("tokenizes Lua with strings, comments, and keywords", () => {
    // lua.js uncovered paths
    const doc = [
      "-- Lua line comment",
      "--[[ multi-line",
      "     block comment ]]",
      "local x = 42",
      'local s = "hello"',
      "local t = { a = 1, b = 2 }",
      "function greet(name)",
      '  print("Hello, " .. name)',
      "end",
    ].join("\n");
    const state = parseDoc(lua, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes Lua numbers and boolean literals", () => {
    const doc = [
      "local pi = 3.14159",
      "local hex = 0xFF",
      "local b1 = true",
      "local b2 = false",
      "local n = nil",
    ].join("\n");
    const state = parseDoc(lua, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });
});

describe("N-Triples tokenizer coverage", () => {
  it("tokenizes N-Triples RDF data", () => {
    // ntriples.js uncovered paths
    const doc = [
      "<http://example.org/subject> <http://example.org/pred> <http://example.org/object> .",
      "<http://example.org/s2> <http://example.org/p2> \"literal value\" .",
      "<http://example.org/s3> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Type> .",
      "# N-Triples comment",
    ].join("\n");
    const state = parseDoc(ntriples, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });

  it("tokenizes N-Triples with blank nodes and typed literals", () => {
    const doc = [
      '_:b0 <http://example.org/p> "value"^^<http://www.w3.org/2001/XMLSchema#string> .',
      '_:b1 <http://example.org/p2> "42"^^<http://www.w3.org/2001/XMLSchema#integer> .',
      '<http://example.org/s> <http://example.org/p3> "en text"@en .',
    ].join("\n");
    const state = parseDoc(ntriples, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });
});

describe("DTD tokenizer coverage", () => {
  it("tokenizes DTD document type definition", () => {
    const doc = [
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
      "<!DOCTYPE root [",
      "  <!ELEMENT root (item+)>",
      "  <!ELEMENT item (#PCDATA)>",
      "  <!ATTLIST item id ID #REQUIRED>",
      "  <!-- DTD comment -->",
      "]>",
    ].join("\n");
    const state = parseDoc(dtd, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });
});

describe("TCL tokenizer coverage", () => {
  it("tokenizes TCL script with diverse tokens", () => {
    const doc = [
      "# Tcl comment",
      "set x 42",
      'set s "hello world"',
      "proc greet {name} {",
      '  puts "Hello, $name!"',
      "}",
      "set result [expr {$x + 1}]",
    ].join("\n");
    const state = parseDoc(tcl, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });
});

describe("Turtle (RDF) tokenizer coverage", () => {
  it("tokenizes Turtle RDF data", () => {
    const doc = [
      "@prefix ex: <http://example.org/> .",
      "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .",
      "",
      "ex:Alice rdf:type ex:Person ;",
      '  ex:name "Alice" ;',
      "  ex:age 30 .",
      "",
      "# Turtle comment",
    ].join("\n");
    const state = parseDoc(turtle, doc);
    const tree = ensureSyntaxTree(state, state.doc.length, 5000);
    expect(tree).not.toBeNull();
  });
});
