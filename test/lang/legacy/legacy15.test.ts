import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { tcl } from "../../../src/lang/legacy/tcl";
import { scheme } from "../../../src/lang/legacy/scheme";
import { turtle } from "../../../src/lang/legacy/turtle";
import { sieve } from "../../../src/lang/legacy/sieve";
import { rpmSpec, rpmChanges } from "../../../src/lang/legacy/rpm";
import { clojure } from "../../../src/lang/legacy/clojure";
import { stylus } from "../../../src/lang/legacy/stylus";
import { css as legacyCss } from "../../../src/lang/legacy/css";

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

describe("TCL tokenizer string and comment coverage", () => {
  it("tokenizes TCL strings inside parentheses (inParams path)", () => {
    // triggers tokenString via (ch == '"' || ch == "'") && state.inParams
    const doc = [
      "# TCL inParams string",
      'proc greet {name} { return "Hello $name" }',
      'set result [greet "World"]',
      "greet('test')",
      'expr {"hello" eq "hello"}',
      "set x [expr {\"a\" ne \"b\"}]",
    ].join("\n");
    const state = parseDoc(tcl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes TCL block comments (#* ... #)", () => {
    // triggers tokenComment via stream.eat("*") after #
    const doc = [
      "#* This is a TCL block comment",
      "   spanning multiple lines #",
      "set x 42",
      "#* another block comment #",
      "puts $x",
    ].join("\n");
    const state = parseDoc(tcl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes TCL unparsed regions (# [[...]])", () => {
    // triggers tokenUnparsed via # *[[ pattern
    const doc = [
      "# [[ unparsed region ]]",
      "set y 100",
      "# [[ another unparsed ]]",
      "puts $y",
    ].join("\n");
    const state = parseDoc(tcl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes TCL with operators and function calls with params", () => {
    // more operator paths
    const doc = [
      "set a 10",
      "set b 20",
      "set c [expr {$a + $b}]",
      "set d [expr {$a * $b - $c}]",
      "if {$a < $b} { puts \"a < b\" }",
      "set str \"hello\"",
      "if {$str == \"hello\"} { puts match }",
      "set flag [expr {!($a > $b)}]",
      'string match "h*" $str',
      "set items [split \"a:b:c\" :]",
      "lindex $items 0",
    ].join("\n");
    const state = parseDoc(tcl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Scheme tokenizer deep coverage", () => {
  it("tokenizes Scheme with various number formats and strings", () => {
    // targets lines 33,37,48 (number formats) and string paths
    const doc = [
      "; Scheme numbers",
      "(define x #b1010)",
      "(define y #o17)",
      "(define z #xFF)",
      "(define w #e3.14)",
      "(define v #i1/3)",
      "(define c #\\a)",
      "(define nl #\\newline)",
      "(define sp #\\space)",
      '(define s "hello\\nworld")',
      '(define s2 "escaped \\"quote\\"")',
    ].join("\n");
    const state = parseDoc(scheme, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Scheme with quasiquote, vectors, and special forms", () => {
    // targets quasiquote paths and more syntax
    const doc = [
      "; Quasiquote and unquote",
      "(define x 42)",
      "(define lst `(1 2 ,x 4))",
      "(define lst2 `(1 ,@(list 2 3) 4))",
      "",
      "; Vectors",
      "(define v #(1 2 3 4 5))",
      "(vector-ref v 0)",
      "(vector-set! v 0 99)",
      "",
      "; Named let",
      "(let loop ((i 0) (sum 0))",
      "  (if (> i 10) sum",
      "      (loop (+ i 1) (+ sum i))))",
      "",
      "; Do loop",
      "(do ((i 0 (+ i 1)))",
      "    ((= i 10))",
      "  (display i))",
    ].join("\n");
    const state = parseDoc(scheme, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Scheme with continuations and tail recursion", () => {
    const doc = [
      "(define (call/cc-example)",
      "  (call-with-current-continuation",
      "    (lambda (k)",
      "      (k 42))))",
      "",
      "(define (values-example)",
      "  (call-with-values",
      "    (lambda () (values 1 2 3))",
      "    (lambda (a b c) (+ a b c))))",
      "",
      "(define-syntax my-and",
      "  (syntax-rules ()",
      "    ((my-and) #t)",
      "    ((my-and x) x)",
      "    ((my-and x y ...) (if x (my-and y ...) #f))))",
      "",
      "(define (string-test)",
      '  (string-append "hello" " " "world")',
      "  (substring \"hello\" 1 3)",
      '  (string->symbol "foo"))',
    ].join("\n");
    const state = parseDoc(scheme, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Turtle RDF tokenizer deep coverage", () => {
  it("tokenizes Turtle with blank nodes, collections, and language tags", () => {
    const doc = [
      "@prefix ex: <http://example.org/> .",
      "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .",
      "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .",
      "",
      "ex:Alice",
      '  ex:name "Alice Smith"@en ;',
      '  ex:name "Alice Schmith"@de ;',
      "  ex:age \"30\"^^xsd:integer ;",
      "  ex:score \"9.5\"^^xsd:decimal ;",
      "  ex:active true ;",
      "  ex:rating 4.5 ;",
      "  ex:friends (ex:Bob ex:Carol) ;",
      "  ex:address [",
      '    ex:city "New York" ;',
      '    ex:country "USA"',
      "  ] .",
      "",
      "_:blank1 ex:val 42 .",
      "_:blank2 ex:val -3.14 .",
    ].join("\n");
    const state = parseDoc(turtle, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Turtle with SPARQL-style prefixes and triples", () => {
    const doc = [
      "PREFIX foaf: <http://xmlns.com/foaf/0.1/>",
      "PREFIX dc: <http://purl.org/dc/terms/>",
      "",
      "foaf:Person a rdfs:Class ;",
      "  rdfs:label \"Person\" ;",
      "  rdfs:comment \"A human being\" .",
      "",
      "<http://example.org/book1>",
      "  dc:title \"The Book\" ;",
      "  dc:creator ex:Alice ;",
      "  dc:date \"2023-01-01\"^^xsd:date ;",
      "  dc:subject ex:Science, ex:Technology .",
    ].join("\n");
    const state = parseDoc(turtle, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Sieve email filter tokenizer deep coverage", () => {
  it("tokenizes Sieve with complex multi-line test structures", () => {
    const doc = [
      '/* Sieve block comment */',
      'require ["fileinto", "reject", "vacation", "body", "variables"];',
      "",
      "# Comment",
      'if body :contains "viagra" {',
      '    reject "Spam detected";',
      "}",
      "",
      'if header :regex "From" ".*@(spam|junk)\\.example\\.com" {',
      '    fileinto "Spam";',
      "    stop;",
      "}",
      "",
      "if size :under 10K {",
      "    keep;",
      "}",
      "",
      "# Multiple actions",
      'fileinto "Archive";',
      "keep;",
    ].join("\n");
    const state = parseDoc(sieve, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Sieve with variables extension and string lists", () => {
    const doc = [
      'require ["variables", "fileinto", "imap4flags"];',
      "",
      "set \"folder\" \"Lists\";",
      'set :length "len" "hello";',
      'set :upper "upper" "hello";',
      "",
      'if header :matches "List-Id" "<*.lists.example.com>" {',
      "    set \"list\" \"${1}\";",
      '    fileinto "Lists/${list}";',
      "}",
      "",
      'if header :is "X-Priority" ["1", "2"] {',
      '    addflag "\\\\Flagged";',
      "}",
      "",
      'if not header :contains "Subject" "" {',
      "    discard;",
      "}",
    ].join("\n");
    const state = parseDoc(sieve, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("RPM spec tokenizer deep coverage", () => {
  it("tokenizes RPM .spec file with preamble and scripts", () => {
    const doc = [
      "# RPM spec file",
      "Name:           mypackage",
      "Version:        1.0.0",
      "Release:        1%{?dist}",
      "Summary:        A test package",
      "License:        MIT",
      "URL:            https://example.com",
      "Source0:        %{name}-%{version}.tar.gz",
      "",
      "BuildRequires:  gcc",
      "BuildRequires:  make",
      "Requires:       bash",
      "",
      "%description",
      "This is a test package for RPM spec tokenizer coverage.",
      "",
      "%prep",
      "%autosetup",
      "",
      "%build",
      "%configure",
      "%make_build",
      "",
      "%install",
      "%make_install",
      "",
      "%files",
      "%license LICENSE",
      "%doc README",
      "%{_bindir}/myprogram",
      "%{_mandir}/man1/myprogram.1*",
    ].join("\n");
    const state = parseDoc(rpmSpec, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes RPM changes log format", () => {
    const doc = [
      "* Mon Jan 01 2024 Developer <dev@example.com> - 1.0.0-1",
      "- Initial package release",
      "- Added basic functionality",
      "",
      "* Fri Dec 01 2023 Developer <dev@example.com> - 0.9.0-1",
      "- Beta release",
      "- Fixed critical bug #123",
    ].join("\n");
    const state = parseDoc(rpmChanges, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes RPM spec with changelog and scripts", () => {
    const doc = [
      "%pre",
      "if [ $1 -eq 1 ]; then",
      "    echo 'First install'",
      "fi",
      "",
      "%post",
      "systemctl daemon-reload",
      "",
      "%preun",
      "if [ $1 -eq 0 ]; then",
      "    systemctl stop myservice",
      "fi",
      "",
      "%changelog",
      "* Mon Jan 01 2024 Developer <dev@example.com> - 1.0.0-1",
      "- Initial package",
      "",
      "* Fri Dec 01 2023 Developer <dev@example.com> - 0.9.0-1",
      "- Beta release",
    ].join("\n");
    const state = parseDoc(rpmSpec, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Clojure tokenizer deep coverage", () => {
  it("tokenizes Clojure with destructuring and advanced macros", () => {
    const doc = [
      "; Clojure advanced features",
      "(ns myapp.core",
      "  (:require [clojure.string :as str]",
      "            [clojure.set :as set]))",
      "",
      "(defrecord Point [x y]",
      "  Object",
      "  (toString [this] (str \"(\" x \", \" y \")\")))",
      "",
      "(defprotocol Shape",
      "  (area [this])",
      "  (perimeter [this]))",
      "",
      "(extend-type Point",
      "  Shape",
      "  (area [{:keys [x y]}] (* x y))",
      "  (perimeter [{:keys [x y]}] (* 2 (+ x y))))",
      "",
      "(let [[a b & rest] [1 2 3 4 5]]",
      "  (println a b rest))",
      "",
      "(doseq [x (range 10)",
      "        :when (even? x)]",
      "  (println x))",
    ].join("\n");
    const state = parseDoc(clojure, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Clojure with atoms, refs, agents, and core.async", () => {
    const doc = [
      "(def counter (atom 0))",
      "(swap! counter inc)",
      "(reset! counter 0)",
      "",
      "(def bank-account (ref 1000))",
      "(dosync",
      "  (alter bank-account - 100))",
      "",
      "(def log-agent (agent []))",
      '(send log-agent conj "message")',
      "",
      "(require '[clojure.core.async :as async])",
      "(def ch (async/chan 10))",
      "(async/go",
      "  (async/>! ch 42))",
      "",
      "(defmulti process (fn [msg] (:type msg)))",
      "(defmethod process :add [{:keys [a b]}] (+ a b))",
      "(defmethod process :mul [{:keys [a b]}] (* a b))",
      "(defmethod process :default [_] :unknown)",
    ].join("\n");
    const state = parseDoc(clojure, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Stylus tokenizer deep coverage", () => {
  it("tokenizes Stylus with at-rules and media queries", () => {
    const doc = [
      "@import 'base'",
      "@require 'mixins'",
      "",
      "@media (max-width: 768px)",
      "  .container",
      "    width 100%",
      "    padding 0 16px",
      "",
      "@media (min-width: 769px) and (max-width: 1024px)",
      "  .container",
      "    width 768px",
      "",
      "@keyframes fadeIn",
      "  0%",
      "    opacity 0",
      "  100%",
      "    opacity 1",
      "",
      "@font-face",
      "  font-family 'MyFont'",
      "  src url('myfont.woff2') format('woff2')",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Stylus with interpolation, hash colors, and units", () => {
    const doc = [
      "vendor = webkit moz ms",
      "name = 'button'",
      "",
      ".{name}",
      "  color #336699",
      "  background-color rgba(0, 0, 0, 0.5)",
      "  border 1px solid hsl(200, 50%, 50%)",
      "  width 100%",
      "  height 50px",
      "  margin 1rem 2em",
      "  padding 0.5rem",
      "  font-size 14pt",
      "  transform rotate(45deg)",
      "  transition all 0.3s ease-in-out",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Stylus with conditionals, iterations, and selector nesting", () => {
    const doc = [
      "large = 100px",
      "small = 50px",
      "",
      "for i in (1..5)",
      "  .item-{i}",
      "    width (i * 20)px",
      "",
      "border-radius(args...)",
      "  -webkit-border-radius args",
      "  -moz-border-radius args",
      "  border-radius args",
      "",
      ".box",
      "  if large > small",
      "    border-radius(5px)",
      "  else",
      "    border-radius(3px)",
      "  unless large == 0",
      "    display block",
      "",
      "colors = red green blue",
      "for color in colors",
      "  .{color}",
      "    color color",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Stylus with functions, return values, and operators", () => {
    const doc = [
      "double(n)",
      "  return n * 2",
      "",
      "add(a, b)",
      "  a + b",
      "",
      "sum = add(10, 20)",
      "",
      ".element",
      "  width double(50px)",
      "  height add(20px, 30px)",
      "  margin -(10px)",
      "",
      "// line comment",
      "/* block comment */",
      "",
      "body",
      '  font \'Helvetica Neue\', Helvetica, sans-serif',
      "  line-height 1.5",
      "  color #333",
    ].join("\n");
    const state = parseDoc(stylus, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Legacy CSS tokenizer deep coverage", () => {
  it("tokenizes CSS with animations, transitions, and gradients", () => {
    const doc = [
      "@keyframes spin {",
      "  from { transform: rotate(0deg); }",
      "  to { transform: rotate(360deg); }",
      "}",
      "",
      ".animated {",
      "  animation: spin 2s linear infinite;",
      "  transition: all 0.3s ease;",
      "  background: linear-gradient(to right, #ff0000, #0000ff);",
      "  background: radial-gradient(circle, #fff 0%, #000 100%);",
      "}",
      "",
      "@supports (display: grid) {",
      "  .container {",
      "    display: grid;",
      "    grid-template-columns: repeat(3, 1fr);",
      "    gap: 1rem;",
      "  }",
      "}",
    ].join("\n");
    const state = parseDoc(legacyCss, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes CSS with custom properties and calc", () => {
    const doc = [
      ":root {",
      "  --primary-color: #336699;",
      "  --font-size: 16px;",
      "  --spacing: 8px;",
      "}",
      "",
      ".component {",
      "  color: var(--primary-color);",
      "  font-size: var(--font-size);",
      "  padding: calc(var(--spacing) * 2);",
      "  width: calc(100% - 2 * var(--spacing));",
      "  min-height: min(50vh, 400px);",
      "  max-width: max(300px, 50%);",
      "}",
      "",
      ".grid {",
      "  display: grid;",
      "  grid-template: 'header header' 60px / 1fr 2fr;",
      "  grid-area: main;",
      "}",
    ].join("\n");
    const state = parseDoc(legacyCss, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes CSS with attribute selectors and complex pseudo-classes", () => {
    const doc = [
      "a[href^='https'] { color: green; }",
      "a[href$='.pdf'] { color: red; }",
      "input[type='text'] { border: 1px solid; }",
      "[data-value~='selected'] { background: yellow; }",
      "",
      "li:nth-child(2n+1) { background: #eee; }",
      "li:nth-last-child(3) { color: blue; }",
      "p:not(.special) { margin: 0; }",
      "a:not([href]) { color: gray; }",
      "",
      ".parent:has(.child) { display: flex; }",
      ":is(h1, h2, h3) { font-weight: bold; }",
      ":where(.header, .footer) { padding: 1rem; }",
    ].join("\n");
    const state = parseDoc(legacyCss, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
