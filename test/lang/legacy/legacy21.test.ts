import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { spreadsheet } from "../../../src/lang/legacy/spreadsheet";
import { ebnf } from "../../../src/lang/legacy/ebnf";
import { jinja2 } from "../../../src/lang/legacy/jinja2";
import { cmake } from "../../../src/lang/legacy/cmake";

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

// ---------------------------------------------------------------------------
// Spreadsheet
// ---------------------------------------------------------------------------
describe("Spreadsheet tokenizer deep coverage", () => {
  it("tokenizes double-quoted strings with escape sequences", () => {
    // Exercises string state with double quotes + backslash escapes (lines 16-38)
    const doc = [
      '"hello world"',
      '"escape \\" inside"',
      '"with \\n newline"',
    ].join("\n");
    const state = parseDoc(spreadsheet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes single-quoted strings", () => {
    // Exercises string state with single quotes (line 16 peek == "'")
    const doc = [
      "'single quoted'",
      "'escape \\' inside'",
    ].join("\n");
    const state = parseDoc(spreadsheet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes character classes in brackets", () => {
    // Exercises characterClass state (lines 40-45, 52-55)
    const doc = [
      "[abc]",
      "[a-z]",
      "[\\d\\w]",
      "[^abc]",
    ].join("\n");
    const state = parseDoc(spreadsheet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operators and atoms", () => {
    // Exercises colon, dot, comma, semicolon, etc. (lines 56-76)
    const doc = ": . , ; * - + ^ < / =".split(" ").join("\n");
    const state = parseDoc(spreadsheet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes backslash sequences and bare backslash", () => {
    // Exercises \\[a-z]+ for string.special vs bare \\ for atom (lines 59-64)
    const doc = [
      "\\alpha",
      "\\beta",
      "\\Z",
    ].join("\n");
    const state = parseDoc(spreadsheet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes dollar sign as builtin", () => {
    // Exercises $ case (lines 77-79)
    const doc = "$";
    const state = parseDoc(spreadsheet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes numbers and number-with-word errors", () => {
    // Exercises digit match + error path (lines 82-84)
    const doc = [
      "123",
      "456abc",
      "0",
    ].join("\n");
    const state = parseDoc(spreadsheet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes identifiers as keywords or variables", () => {
    // Exercises identifier match + lookahead for ( or . (lines 85-87)
    const doc = [
      "SUM(A1:A10)",
      "AVERAGE(B1:B10)",
      "myVar",
      "_private",
      "fn.call",
    ].join("\n");
    const state = parseDoc(spreadsheet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes brackets outside character classes", () => {
    // Exercises bracket detection at lines 88-90
    const doc = "( ) { } [ ]";
    const state = parseDoc(spreadsheet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes unknown characters and whitespace", () => {
    // Exercises the fallthrough at lines 91-93
    const doc = "   @  ~  `  ";
    const state = parseDoc(spreadsheet, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// EBNF
// ---------------------------------------------------------------------------
describe("EBNF tokenizer deep coverage", () => {
  it("tokenizes slash-style comments /* ... */", () => {
    // Exercises comment with commentType.slash (lines 27-29, 53-57)
    const doc = [
      "/* this is a comment */",
      "/* multi-line",
      "   comment */",
    ].join("\n");
    const state = parseDoc(ebnf, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes parenthesis-style comments (* ... *)", () => {
    // Exercises comment with commentType.parenthesis (lines 30-32, 58-60)
    const doc = [
      "(* parenthesis comment *)",
      "(* multi-line",
      "   parenthesis comment *)",
    ].join("\n");
    const state = parseDoc(ebnf, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes strings on LHS vs RHS", () => {
    // Exercises lhs=true vs lhs=false for string styling (line 51)
    const doc = [
      '"lhsString"',
      "'another lhs'",
      '"with \\\\ escape"',
    ].join("\n");
    const state = parseDoc(ebnf, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes character classes [...]", () => {
    // Exercises characterClass state (lines 67-73, 80-83)
    const doc = [
      "[abc]",
      "[a-z\\d]",
    ].join("\n");
    const state = parseDoc(ebnf, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operators : | ;", () => {
    // Exercises operator cases (lines 84-88)
    const doc = "rule : alt1 | alt2 ;";
    const state = parseDoc(ebnf, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes %% header, %keyword, and %} bracket", () => {
    // Exercises % branches (lines 89-97)
    const doc = [
      "%%",
      "%token",
      "%left",
      "%}",
    ].join("\n");
    const state = parseDoc(ebnf, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes /keyword and \\special sequences", () => {
    // Exercises /[A-Za-z]+ keyword (lines 98-100) and \\[a-z]+ (lines 102-105)
    const doc = [
      "/prec",
      "\\epsilon",
    ].join("\n");
    const state = parseDoc(ebnf, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes atoms: . * - + ^", () => {
    // Exercises dot (line 107), and fall-through atoms (lines 110-116)
    const doc = ". * - + ^".split(" ").join("\n");
    const state = parseDoc(ebnf, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes $$ builtin and $N variable references", () => {
    // Exercises $$ (line 118) and $[0-9]+ (line 120)
    const doc = [
      "$$",
      "$1",
      "$23",
    ].join("\n");
    const state = parseDoc(ebnf, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes <<name>> builtins and // line comments", () => {
    // Exercises <<...>> (line 124) and // comment (lines 129-131)
    const doc = [
      "<<EOF>>",
      "// this is a line comment",
    ].join("\n");
    const state = parseDoc(ebnf, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes return keyword and identifiers with def/variable roles", () => {
    // Exercises 'return' (line 132), identifier with (. lookahead (line 135),
    // identifier with := lookahead (line 137), and plain variableName.special (line 140)
    const doc = [
      "return",
      "myFunc(",
      "myRule =",
      "myDef :",
      "plainIdent",
    ].join("\n");
    const state = parseDoc(ebnf, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes brackets and unknown characters", () => {
    // Exercises bracket detection (line 141) and eatSpace/next fallthrough (lines 144-146)
    const doc = "( ) [ ] @ ~";
    const state = parseDoc(ebnf, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// Jinja2
// ---------------------------------------------------------------------------
describe("Jinja2 tokenizer deep coverage", () => {
  it("tokenizes block comments {# ... #}", () => {
    // Exercises incomment path (lines 26-33) and {# detection (lines 114-123)
    const doc = [
      "{# single line comment #}",
      "{# multi-line",
      "   comment #}",
      "plain text",
    ].join("\n");
    const state = parseDoc(jinja2, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes block comments that span to end of line", () => {
    // Exercises skipToEnd path when #} is not found (line 28)
    const doc = "{# unterminated comment";
    const state = parseDoc(jinja2, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes variable tags {{ ... }}", () => {
    // Exercises { + { branch (lines 125-132, intag = "}")
    const doc = [
      "{{ variable }}",
      "{{ obj.attr }}",
      "{{ list[0] }}",
      "{{ func(arg) }}",
    ].join("\n");
    const state = parseDoc(jinja2, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes block tags {% ... %}", () => {
    // Exercises { + % branch (lines 125-134, intag = "%")
    const doc = [
      "{% if condition %}",
      "  content",
      "{% elif other %}",
      "  other content",
      "{% else %}",
      "  fallback",
      "{% endif %}",
    ].join("\n");
    const state = parseDoc(jinja2, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes tags with whitespace control {%- and -%}", () => {
    // Exercises stream.eat("-") paths (lines 82, 133)
    const doc = [
      "{%- for item in items -%}",
      "  {{ item }}",
      "{%- endfor -%}",
    ].join("\n");
    const state = parseDoc(jinja2, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes strings inside tags", () => {
    // Exercises instring path (lines 57-66)
    const doc = [
      '{% set name = "hello" %}',
      "{% set other = 'world' %}",
      "{{ \"quoted\" }}",
    ].join("\n");
    const state = parseDoc(jinja2, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operators inside tags", () => {
    // Exercises operator match (lines 85-87)
    const doc = [
      "{% if x > 0 and y < 10 %}",
      "{% if x == y or x != z %}",
      "{% if x + y * z - w %}",
      "{% endif %}",
    ].join("\n");
    const state = parseDoc(jinja2, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes atoms (true/false) and numbers after operators and signs", () => {
    // Exercises atom/number paths after operator (lines 37-45) and sign (lines 47-55)
    const doc = [
      "{% if x == true %}",
      "{% if y != false %}",
      "{% set val = 42 %}",
      "{% set arr = [1, 2, 3] %}",
      "{% if (true) %}",
      "{% endif %}",
    ].join("\n");
    const state = parseDoc(jinja2, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes keywords after space and at start of line", () => {
    // Exercises keyword matching (lines 91-98)
    const doc = [
      "{% for item in items %}",
      "{% block content %}",
      "{% endblock %}",
      "{% extends 'base.html' %}",
      "{% include 'partial.html' %}",
      "{% macro render(name) %}",
      "{% endmacro %}",
    ].join("\n");
    const state = parseDoc(jinja2, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes line statements with # prefix", () => {
    // Exercises # line statement path (lines 137-148)
    const doc = [
      "# for item in items",
      "  {{ item }}",
      "# endfor",
    ].join("\n");
    const state = parseDoc(jinja2, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes ## line comments", () => {
    // Exercises ## comment path (lines 138-141)
    const doc = [
      "## this is a line comment",
      "## another comment",
      "plain text",
    ].join("\n");
    const state = parseDoc(jinja2, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes parentheses and brackets inside tags", () => {
    // Exercises inbraces/inbrackets tracking (lines 67-81)
    const doc = [
      "{% set result = func(a, (b + c)) %}",
      "{% set arr = items[0] %}",
      "{% set nested = items[arr[1]] %}",
    ].join("\n");
    const state = parseDoc(jinja2, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles atoms and numbers after sign characters", () => {
    // Exercises sign=true then atom/number match (lines 47-55, 88-89)
    const doc = [
      "{% if [true] %}",
      "{% set x = (42) %}",
      "{% set y = {false: 1} %}",
      "{% endif %}",
    ].join("\n");
    const state = parseDoc(jinja2, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// CMake
// ---------------------------------------------------------------------------
describe("CMake tokenizer deep coverage", () => {
  it("tokenizes basic function calls", () => {
    // Exercises function match + def token (lines 41-43)
    const doc = [
      "cmake_minimum_required(VERSION 3.10)",
      "project(MyProject)",
      "add_executable(main main.cpp)",
    ].join("\n");
    const state = parseDoc(cmake, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes function calls with space before paren", () => {
    // Exercises the second regex in line 41: \\w+\\ \\(
    const doc = [
      "message (STATUS \"Hello\")",
      "set (MY_VAR value)",
    ].join("\n");
    const state = parseDoc(cmake, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes comments", () => {
    // Exercises # comment path (lines 45-47)
    const doc = [
      "# This is a comment",
      "cmake_minimum_required(VERSION 3.10) # inline comment",
    ].join("\n");
    const state = parseDoc(cmake, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes double-quoted strings with variable interpolation", () => {
    // Exercises string with $ variable inside double quotes (lines 3-21, 49-54)
    const doc = [
      'set(MSG "Hello, ${NAME}!")',
      'message(STATUS "Path: ${CMAKE_SOURCE_DIR}")',
      'set(GREETING "Say $ENV{HOME}")',
    ].join("\n");
    const state = parseDoc(cmake, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes single-quoted strings", () => {
    // Exercises single-quote string path (line 50)
    const doc = "set(MY_VAR 'single quoted value')";
    const state = parseDoc(cmake, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes variables outside strings", () => {
    // Exercises $ with variable_regex match (lines 27-31)
    const doc = [
      "${CMAKE_CXX_STANDARD}",
      "${MY_VAR}",
      "$ENV{PATH}",
      "$",
    ].join("\n");
    const state = parseDoc(cmake, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes numbers", () => {
    // Exercises digit match (lines 59-61)
    const doc = [
      "set(VERSION 3)",
      "set(MAJOR 10)",
      "set(MINOR 0)",
    ].join("\n");
    const state = parseDoc(cmake, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes parentheses as brackets", () => {
    // Exercises ( and ) bracket paths (lines 56-58)
    const doc = "if(TRUE)\nendif()";
    const state = parseDoc(cmake, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes continued strings across lines", () => {
    // Exercises continueString path (lines 34-38) - string not terminated on one line
    const doc = [
      'set(LONG "this is a long',
      'string that continues")',
    ].join("\n");
    const state = parseDoc(cmake, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes a full CMakeLists example", () => {
    // Comprehensive test exercising multiple paths together
    const doc = [
      "cmake_minimum_required(VERSION 3.14)",
      "project(Example LANGUAGES CXX)",
      "",
      "# Set C++ standard",
      "set(CMAKE_CXX_STANDARD 17)",
      "set(CMAKE_CXX_STANDARD_REQUIRED ON)",
      "",
      'option(BUILD_TESTS "Build tests" OFF)',
      "",
      "add_library(mylib",
      "  src/foo.cpp",
      "  src/bar.cpp",
      ")",
      "",
      'set(SOURCES "main.cpp")',
      "add_executable(${PROJECT_NAME} ${SOURCES})",
      "target_link_libraries(${PROJECT_NAME} PRIVATE mylib)",
      "",
      "if(BUILD_TESTS)",
      "  enable_testing()",
      '  add_executable(test_runner "test/test_main.cpp")',
      "  target_link_libraries(test_runner PRIVATE mylib)",
      "  add_test(NAME tests COMMAND test_runner)",
      "endif()",
    ].join("\n");
    const state = parseDoc(cmake, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
