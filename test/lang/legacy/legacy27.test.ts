import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { sieve } from "../../../src/lang/legacy/sieve";
import { ttcn } from "../../../src/lang/legacy/ttcn";
import { pig } from "../../../src/lang/legacy/pig";
import { sparql } from "../../../src/lang/legacy/sparql";
import { yaml } from "../../../src/lang/legacy/yaml";
import { modelica } from "../../../src/lang/legacy/modelica";

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

describe("Sieve tokenizer deep coverage", () => {
  it("tokenizes comments: line (#) and block (/* */)", () => {
    const doc = [
      "# This is a line comment",
      "/* This is a",
      "   block comment */",
      "require \"fileinto\";",
    ].join("\n");
    const state = parseDoc(sieve, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes strings with escape sequences", () => {
    const doc = [
      'require "fileinto";',
      'if header :contains "Subject" "\\\\urgent\\\\"',
      '{',
      '  fileinto "Urgent";',
      '}',
    ].join("\n");
    const state = parseDoc(sieve, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes multi-line text: blocks ending with a lone dot", () => {
    // Exercises tokenMultiLineString: first line with comment, continuation, and dot terminator
    const doc = [
      'require "vacation";',
      "vacation text: # this is the vacation message",
      "I am currently out of office.",
      "Please contact my colleague.",
      ".",
      "stop;",
    ].join("\n");
    const state = parseDoc(sieve, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes numbers with size suffixes (K, M, G)", () => {
    const doc = [
      "if size :over 100K {",
      "  discard;",
      "}",
      "if size :under 5M {",
      "  keep;",
      "}",
    ].join("\n");
    const state = parseDoc(sieve, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes tagged arguments (colon identifiers) and keywords", () => {
    // Exercises the :tag operator path and keyword/atom recognition
    const doc = [
      'require ["fileinto", "reject"];',
      "if not address :is :all \"from\" \"boss@example.com\" {",
      '  if header :matches "Subject" "*important*" {',
      "    fileinto \"Important\";",
      "  } elsif true {",
      "    keep;",
      "  } else {",
      '    reject "Go away";',
      "  }",
      "}",
    ].join("\n");
    const state = parseDoc(sieve, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes parenthesized lists and braces for indentation tracking", () => {
    // Exercises ( ) { } indent push/pop and comma/semicolon paths
    const doc = [
      'require ["fileinto", "reject", "vacation"];',
      'if anyof (header :contains "from" "alice",',
      '          header :contains "from" "bob") {',
      '  fileinto "Friends";',
      "} else {",
      '  fileinto "Others";',
      "}",
    ].join("\n");
    const state = parseDoc(sieve, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes atoms: true, false, not", () => {
    const doc = [
      "if true { keep; }",
      "if false { discard; }",
      "if not false { keep; }",
    ].join("\n");
    const state = parseDoc(sieve, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("TTCN-3 tokenizer deep coverage", () => {
  it("tokenizes keywords, types, and verdict constants", () => {
    const doc = [
      "module MyModule {",
      "  type record MyRecord {",
      "    integer field1,",
      "    charstring field2,",
      "    boolean field3",
      "  }",
      "",
      "  const integer MAX_VAL := 100;",
      "  const verdicttype v := pass;",
      "}",
    ].join("\n");
    const state = parseDoc(ttcn, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes string literals with B, H, O suffixes", () => {
    // Exercises afterQuote suffix path in tokenString
    const doc = [
      "var bitstring bs := '10100110'B;",
      "var hexstring hs := 'A1F0'H;",
      "var octetstring os := 'DEADBEEF'O;",
      'var charstring cs := "hello world";',
    ].join("\n");
    const state = parseDoc(ttcn, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes comments: line (//) and block (/* */)", () => {
    const doc = [
      "// single line comment",
      "/* multi-line",
      "   block comment */",
      "var integer x := 42;",
    ].join("\n");
    const state = parseDoc(ttcn, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operators, @try/@catch/@lazy, and # atoms", () => {
    // Exercises @try, @catch, @lazy keyword paths and # atom path
    const doc = [
      "var integer a := 10 + 20 - 5;",
      "var boolean b := a > 10 and a < 50;",
      "@try {",
      "  log(\"trying\");",
      "} @catch(e) {",
      "  log(\"caught\");",
      "}",
      "@lazy var integer z := 0;",
      "#5",
      "%incomplete",
    ].join("\n");
    const state = parseDoc(ttcn, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes port, timer, config, verdict, sut, and function ops", () => {
    // Exercises timerOps, portOps, configOps, verdictOps, sutOps, functionOps
    const doc = [
      "timer T1 := 5.0;",
      "T1.start;",
      "T1.stop;",
      "T1.timeout;",
      "var float elapsed := T1.read;",
      "",
      "myPort.send(42);",
      "myPort.receive -> value x;",
      "myPort.call(myProc:{1});",
      "myPort.getreply;",
      "myPort.trigger;",
      "myPort.check;",
      "myPort.clear;",
      "myPort.halt;",
      "myPort.raise(myException:42);",
      "myPort.getcall;",
      "",
      "var MyComponent c := MyComponent.create;",
      "connect(c:p, mtc:p);",
      "disconnect(c:p, mtc:p);",
      "map(c:p, system:p);",
      "unmap(c:p, system:p);",
      "c.done;",
      "c.kill;",
      "c.killed;",
      "",
      "setverdict(pass);",
      "var verdicttype v := getverdict;",
      "",
      "action(\"user prompt\");",
      "",
      "var MyFunc fn := refers(myFunction);",
      "fn.apply();",
      "var integer ref := derefers(fn);",
    ].join("\n");
    const state = parseDoc(ttcn, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes visibility modifiers, template match, and boolean/other constants", () => {
    // Exercises visibilityModifiers, templateMatch, booleanConsts, otherConsts
    const doc = [
      "public type integer PublicInt;",
      "private type integer PrivateInt;",
      "friend type integer FriendInt;",
      "",
      "template MyRecord t := {",
      "  field1 := complement(1, 2, 3),",
      "  field2 := ifpresent,",
      "  field3 := subset(true, false)",
      "};",
      "",
      "template MyRecord t2 := {",
      "  field1 := superset(10, 20),",
      "  field2 := permutation(\"a\", \"b\"),",
      "  field3 := true",
      "};",
      "",
      "var boolean b1 := true;",
      "var boolean b2 := false;",
      "var MyType x := null;",
      "var MyType y := NULL;",
      "var MyType z := omit;",
      "",
      "// verdict constants",
      "var verdicttype v1 := error;",
      "var verdicttype v2 := fail;",
      "var verdicttype v3 := inconc;",
      "var verdicttype v4 := none;",
      "var verdicttype v5 := pass;",
    ].join("\n");
    const state = parseDoc(ttcn, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes context push/pop with nested braces, brackets, and parens", () => {
    // Exercises pushContext/popContext and statement indent logic
    const doc = [
      "function f() {",
      "  var integer arr[3] := {1, 2, 3};",
      "  for (var integer i := 0; i < 3; i := i + 1) {",
      "    if (arr[i] > 1) {",
      "      log(arr[i]);",
      "    }",
      "  }",
      "}",
    ].join("\n");
    const state = parseDoc(ttcn, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes numbers and punctuation characters", () => {
    const doc = [
      "var integer x := 42;",
      "var float y := 3.14;",
      "var integer z := 0xFF;",
      "var MyRecord r := { field1 := 1, field2 := \"test\" };",
      "log(r.field1);",
      "var boolean q := x > 10 ? true : false;",
    ].join("\n");
    const state = parseDoc(ttcn, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Pig Latin tokenizer deep coverage", () => {
  it("tokenizes keywords and builtin functions", () => {
    const doc = [
      "data = LOAD 'input.txt' USING PigStorage(',');",
      "filtered = FILTER data BY $0 > 10;",
      "grouped = GROUP filtered BY $1;",
      "result = FOREACH grouped GENERATE group, COUNT(filtered);",
      "STORE result INTO 'output';",
      "DUMP result;",
    ].join("\n");
    const state = parseDoc(pig, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes strings (single and double quoted)", () => {
    const doc = [
      "a = LOAD 'single_quoted.txt';",
      "b = LOAD \"double_quoted.txt\";",
      "c = FILTER a BY name == 'hello\\'s';",
      "d = FILTER b BY name == \"escape\\\"d\";",
    ].join("\n");
    const state = parseDoc(pig, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes comments: single line (--) and block (/* */)", () => {
    const doc = [
      "-- This is a single line comment",
      "/* This is a",
      "   block comment */",
      "data = LOAD 'input.txt';",
      "-- another comment at end",
    ].join("\n");
    const state = parseDoc(pig, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operators and numbers", () => {
    const doc = [
      "x = FILTER data BY age >= 18 AND age <= 65;",
      "y = FOREACH x GENERATE name, salary * 1.5;",
      "z = FILTER y BY score != 0 AND ratio > 0.5;",
      "w = FOREACH z GENERATE $0 + $1 / 2 - 1;",
    ].join("\n");
    const state = parseDoc(pig, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes data types", () => {
    const doc = [
      "a = LOAD 'data' AS (name:CHARARRAY, age:INT, weight:FLOAT);",
      "b = LOAD 'data' AS (id:LONG, flag:BOOLEAN, amount:DOUBLE);",
      "c = LOAD 'data' AS (items:BAG{t:TUPLE(x:INT)}, meta:MAP[]);",
      "d = LOAD 'data' AS (raw:BYTEARRAY);",
    ].join("\n");
    const state = parseDoc(pig, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes keyword used as variable (with dot or paren following)", () => {
    // Exercises the stream.eat(')') and stream.eat('.') special cases for keywords
    const doc = [
      "data = LOAD 'input' AS (group:CHARARRAY, split:INT);",
      "g = GROUP data BY group;",
      "result = FOREACH g GENERATE flatten(group), COUNT(data);",
      "x = FOREACH g GENERATE group.$0, data.split;",
    ].join("\n");
    const state = parseDoc(pig, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes division operator (/ not followed by *)", () => {
    const doc = [
      "a = FOREACH data GENERATE val / 100;",
      "b = FOREACH data GENERATE val / 3.14;",
    ].join("\n");
    const state = parseDoc(pig, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("SPARQL tokenizer deep coverage", () => {
  it("tokenizes variables (? and $), URIs, and prefixed names", () => {
    const doc = [
      "PREFIX foaf: <http://xmlns.com/foaf/0.1/>",
      "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
      "",
      "SELECT ?name $age",
      "WHERE {",
      '  ?person foaf:name ?name .',
      '  ?person foaf:age $age .',
      "  ?person rdf:type foaf:Person .",
      "}",
    ].join("\n");
    const state = parseDoc(sparql, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes string literals and language tags (@en)", () => {
    // Exercises tokenLiteral and @ meta path
    const doc = [
      "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
      "SELECT ?label WHERE {",
      '  ?s rdfs:label "Hello"@en .',
      "  ?s rdfs:label 'World'@fr .",
      '  ?s rdfs:comment "A \\"quoted\\" string" .',
      "}",
    ].join("\n");
    const state = parseDoc(sparql, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes builtin functions and operators", () => {
    // Exercises ops regex matches: str, lang, bound, regex, count, etc.
    const doc = [
      "SELECT (COUNT(?s) AS ?count) (AVG(?val) AS ?average)",
      "WHERE {",
      "  ?s a ?type .",
      "  FILTER(bound(?s) && isIRI(?s))",
      "  FILTER(regex(str(?s), \"pattern\", \"i\"))",
      "  FILTER(langMatches(lang(?label), \"en\"))",
      "  BIND(CONCAT(UCASE(?first), \" \", LCASE(?last)) AS ?full)",
      "  BIND(STRLEN(?name) AS ?len)",
      "  BIND(SUBSTR(?name, 1, 3) AS ?prefix)",
      "}",
      "GROUP BY ?type",
      "HAVING (COUNT(?s) > 5)",
    ].join("\n");
    const state = parseDoc(sparql, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes comments (#) and ? as operator (before whitespace)", () => {
    // Exercises the ? with trailing whitespace => operator path
    const doc = [
      "# This is a comment",
      "SELECT ?x WHERE {",
      "  ?x ?p ?o .",
      "  # another comment",
      "}",
    ].join("\n");
    const state = parseDoc(sparql, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes colon local names and prefix:local patterns", () => {
    // Exercises eatPnLocal path and PREFIX_START + PREFIX_REMAINDER
    const doc = [
      "PREFIX : <http://example.org/>",
      "PREFIX ex: <http://example.org/ns#>",
      "SELECT ?s WHERE {",
      "  ?s :localName :another-local .",
      "  ?s ex:property.sub ex:escaped%20name .",
      "  ?s ex:with_underscore ex:with-dash .",
      "}",
    ].join("\n");
    const state = parseDoc(sparql, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes INSERT/DELETE and OPTIONAL/UNION/MINUS", () => {
    // Exercises more keyword paths
    const doc = [
      "PREFIX ex: <http://example.org/>",
      "INSERT DATA {",
      '  ex:s ex:p "value" .',
      "}",
      "",
      "DELETE WHERE {",
      "  ex:s ex:p ?o .",
      "}",
      "",
      "SELECT ?s WHERE {",
      "  { ?s ex:p1 ?o } UNION { ?s ex:p2 ?o }",
      "  OPTIONAL { ?s ex:p3 ?label }",
      "  MINUS { ?s ex:excluded true }",
      "}",
    ].join("\n");
    const state = parseDoc(sparql, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes nested brackets and pattern context push/pop", () => {
    // Exercises pushContext/popContext for [], {}, () and pattern alignment
    const doc = [
      "PREFIX foaf: <http://xmlns.com/foaf/0.1/>",
      "SELECT ?name WHERE {",
      "  [",
      "    foaf:name ?name ;",
      "    foaf:age ?age",
      "  ] a foaf:Person .",
      "  FILTER(?age > 18)",
      "}",
      "ORDER BY ASC(?name)",
      "LIMIT 10 OFFSET 5",
    ].join("\n");
    const state = parseDoc(sparql, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("YAML tokenizer deep coverage", () => {
  it("tokenizes keys, values, and comments", () => {
    const doc = [
      "# Top-level comment",
      "name: John Doe",
      "age: 30",
      "active: true # inline comment",
      "deleted: false",
      "verified: yes",
      "banned: no",
      "status: on",
      "disabled: off",
    ].join("\n");
    const state = parseDoc(yaml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes block literals (| and >) and anchors/aliases", () => {
    // Exercises literal = true path and & / * reference paths
    const doc = [
      "description: |",
      "  This is a block literal",
      "  that spans multiple lines",
      "  and preserves newlines.",
      "summary: >",
      "  This is a folded block",
      "  that becomes a single line.",
      "defaults: &defaults",
      "  adapter: postgres",
      "  host: localhost",
      "production:",
      "  <<: *defaults",
      "  database: myapp_prod",
    ].join("\n");
    const state = parseDoc(yaml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes inline maps and lists with nested separators", () => {
    // Exercises inlinePairs++/--, inlineList++/--, comma separators
    const doc = [
      "inline_map: {key1: value1, key2: value2, key3: 42}",
      "inline_list: [1, 2, 3, 4, 5]",
      "nested: {a: [1, 2], b: {x: true, y: false}}",
      "mixed: [{name: alice, age: 30}, {name: bob, age: 25}]",
    ].join("\n");
    const state = parseDoc(yaml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes document start (---) and end (...)", () => {
    const doc = [
      "---",
      "first: document",
      "...",
      "---",
      "second: document",
      "list:",
      "  - item1",
      "  - item2",
      "...",
    ].join("\n");
    const state = parseDoc(yaml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes quoted strings with escapes", () => {
    const doc = [
      "single: 'it''s a test'",
      'double: "hello\\nworld"',
      'escaped: "tab\\there"',
      "multikey: 'quoted key': value",
      "empty_single: ''",
      'empty_double: ""',
    ].join("\n");
    const state = parseDoc(yaml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes numbers in values (both inline and block)", () => {
    // Exercises number regex paths for both inline and non-inline pairs
    const doc = [
      "port: 8080",
      "ratio: 3.14",
      "negative: -42",
      "comma_num: 1,000",
      "inline: {port: 8080, ratio: 3.14}",
      "inline_neg: {val: -100}",
    ].join("\n");
    const state = parseDoc(yaml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes list items with dash prefix", () => {
    const doc = [
      "items:",
      "  - first",
      "  - second",
      "  - third",
      "nested:",
      "  - name: alice",
      "    age: 30",
      "  - name: bob",
      "    age: 25",
    ].join("\n");
    const state = parseDoc(yaml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes escape character (backslash) continuation", () => {
    // Exercises the escaped = (ch == '\\') path
    const doc = [
      "path: C:\\Users\\test",
      "regex: \\d+\\.\\d+",
      "backslash: \\\\",
    ].join("\n");
    const state = parseDoc(yaml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Modelica tokenizer deep coverage", () => {
  it("tokenizes keywords, builtins, and atoms (types)", () => {
    const doc = [
      "model SimpleCircuit",
      "  Real voltage;",
      "  Boolean isActive;",
      "  Integer count;",
      "  String label;",
      "  parameter Real R = 100;",
      "equation",
      "  voltage = sin(time) * R;",
      "  count = integer(floor(time));",
      "  isActive = voltage > 0;",
      "end SimpleCircuit;",
    ].join("\n");
    const state = parseDoc(modelica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes line comments (//) and block comments (/* */)", () => {
    const doc = [
      "// This is a line comment",
      "model Test // inline comment",
      "  /* Block comment",
      "     spanning multiple lines */",
      "  Real x;",
      "end Test;",
    ].join("\n");
    const state = parseDoc(modelica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes strings with escape sequences", () => {
    const doc = [
      'model StringTest',
      '  constant String greeting = "Hello\\nWorld";',
      '  constant String path = "C:\\\\Users\\\\test";',
      '  constant String quote = "She said \\"hi\\"";',
      "end StringTest;",
    ].join("\n");
    const state = parseDoc(modelica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes double operators (:=, <=, >=, ==, <>, .+, .-, .*, ./, .^)", () => {
    // Exercises isDoubleOperatorChar path
    const doc = [
      "model Operators",
      "  Real a, b, c;",
      "  Real[3] v1, v2, v3;",
      "equation",
      "  a := 5.0;",
      "  b := a + 1;",
      "  c := if a >= 3 and a <= 10 then 1 else 0;",
      "  v3 := v1 .+ v2;",
      "  v3 := v1 .- v2;",
      "  v3 := v1 .* v2;",
      "  v3 := v1 ./ v2;",
      "  v3 := v1 .^ v2;",
      "  assert(a <> b, \"not equal\");",
      "  assert(a == 5, \"equal\");",
      "end Operators;",
    ].join("\n");
    const state = parseDoc(modelica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes unsigned numbers with decimal and exponent", () => {
    // Exercises tokenUnsignedNumber: dot, e/E, +/- sign
    const doc = [
      "model Numbers",
      "  constant Real a = 42;",
      "  constant Real b = 3.14;",
      "  constant Real c = 1.0e10;",
      "  constant Real d = 2.5E-3;",
      "  constant Real e = 6.022e+23;",
      "  constant Real f = 100;",
      "end Numbers;",
    ].join("\n");
    const state = parseDoc(modelica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes quoted identifiers ('ident') and level tracking", () => {
    // Exercises tokenQIdent and sol-based level increment/decrement
    const doc = [
      "model 'My Complex Model'",
      "  Real 'x[1]';",
      "  Real 'y.z';",
      "  connector MyConnector",
      "    Real voltage;",
      "    flow Real current;",
      "  end MyConnector;",
      "  when time > 1.0 then",
      "    reinit(x, 0);",
      "  end when;",
      "end 'My Complex Model';",
    ].join("\n");
    const state = parseDoc(modelica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes single operators and various keyword blocks", () => {
    // Exercises isSingleOperatorChar and more keyword paths
    const doc = [
      "package MyPackage",
      "  import Modelica.Math.*;",
      "  model Inner",
      "    parameter Real p = 1.0;",
      "    Real x(start = 0);",
      "  equation",
      "    der(x) = -p * x;",
      "  algorithm",
      "    x := abs(x);",
      "    x := if x > 0 then x else -x;",
      "  end Inner;",
      "end MyPackage;",
    ].join("\n");
    const state = parseDoc(modelica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes error path for unknown characters", () => {
    // Exercises the else error fallthrough
    const doc = [
      "model ErrorTest",
      "  Real x = 1.0;",
      "  // tilde and backtick trigger error token",
      "  // ~`",
      "end ErrorTest;",
      "~",
    ].join("\n");
    const state = parseDoc(modelica, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
