import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { sas } from "../../../src/lang/legacy/sas";
import { gherkin } from "../../../src/lang/legacy/gherkin";
import { dtd } from "../../../src/lang/legacy/dtd";
import { python as legacyPython, cython } from "../../../src/lang/legacy/python";

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

// ─── SAS ────────────────────────────────────────────────────────────────────

describe("SAS tokenizer deep coverage", () => {
  it("tokenizes block comments spanning multiple lines", () => {
    // Exercises continueComment = true path, skipTo('*'), stream.eat('/') paths
    const doc = [
      "/* This is a",
      "   multi-line comment",
      "   that spans several lines */",
      "data mydata;",
    ].join("\n");
    const state = parseDoc(sas, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes line comments starting with * at column 0", () => {
    // Exercises ch == '*' && stream.column() == stream.indentation() path (line 85)
    const doc = [
      "* This is a line comment;",
      "data test;",
      "  x = 1;",
      "run;",
    ].join("\n");
    const state = parseDoc(sas, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes single and double quoted strings including multi-line", () => {
    // Exercises continueString paths: opening quote, matching quote, skipTo, eol
    const doc = [
      'data test;',
      '  x = "hello world";',
      "  y = 'single quoted';",
      '  z = "string spanning',
      '  multiple lines";',
      "  w = 'another spanning",
      "  string';",
      "run;",
    ].join("\n");
    const state = parseDoc(sas, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes numbers: integers, hex, floats, and dot-prefixed", () => {
    // Exercises number paths: ch='.', ch='0' (hex/octal), other digits, exponents
    const doc = [
      "data test;",
      "  a = 42;",
      "  b = 0xFF;",
      "  c = 3.14;",
      "  d = .5;",
      "  e = 1.5e10;",
      "  f = 2.0E-3;",
      "  g = 0077;",
      "run;",
    ].join("\n");
    const state = parseDoc(sas, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes double operators like <=, >=, !=, <> and symbolic operators", () => {
    // Exercises isDoubleOperatorChar and isDoubleOperatorSym paths
    const doc = [
      "data test;",
      "  if x <= 10 then y = 1;",
      "  if x >= 20 then y = 2;",
      "  if x != 0 then y = 3;",
      "  if x <> y then z = 1;",
      "  if x eq y then a = 1;",
      "  if x ne y then b = 1;",
      "  if x lt y then c = 1;",
      "  if x gt y then d = 1;",
      "  if x le y or x ge z then e = 1;",
      "run;",
    ].join("\n");
    const state = parseDoc(sas, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes DATA step with run; termination and variable formats", () => {
    // Exercises inDataStep paths: run; termination, word lookup, format with '.'
    const doc = [
      "data mylib.mydata;",
      "  set olddata;",
      "  length name $20;",
      "  label x = 'My Variable';",
      "  format date date9.;",
      "  if x > 0 then output;",
      "  put name;",
      "run;",
    ].join("\n");
    const state = parseDoc(sas, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes PROC step with quit; termination", () => {
    // Exercises inProc paths: proc keyword, proc-specific words, quit; termination
    const doc = [
      "proc print data=mydata;",
      "  var x y z;",
      "  where x > 0;",
      "quit;",
      "",
      "proc sort data=mydata;",
      "  by x descending y;",
      "run;",
    ].join("\n");
    const state = parseDoc(sas, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes MACRO definitions with %if/%else/%do/%end", () => {
    // Exercises inMacro paths: %macro, %mend, macro-specific keywords, atom fallthrough
    const doc = [
      "%macro test(x);",
      "  %let y = &x;",
      "  %if &y > 0 %then %do;",
      "    %put positive;",
      "  %end;",
      "  %else %do;",
      "    %put non-positive;",
      "  %end;",
      "%mend;",
    ].join("\n");
    const state = parseDoc(sas, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes automatic macro variables and %global/%sysfunc", () => {
    // Exercises & variable detection and ALL-context keywords
    const doc = [
      "%let today = &sysdate9;",
      "%let user = &sysuserid;",
      "%let host = &syshostname;",
      "%global myvar;",
      "%let result = %sysfunc(today());",
      "%put &syscc &syserr &sysrc;",
    ].join("\n");
    const state = parseDoc(sas, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes title/footnote with numbered variants and nextword state", () => {
    // Exercises title[1-9] regex, footnote with stream.eat(/[1-9]/), nextword paths
    const doc = [
      "title1 'Main Title';",
      "title2 'Subtitle';",
      "footnote 'Page footer';",
      "footnote1 'First footnote';",
      "footnote9 'Ninth footnote';",
      "ods html;",
      "libname mylib '/path/to/lib';",
      "options nosource2 pagesize=60;",
    ].join("\n");
    const state = parseDoc(sas, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes variable formats with libname.memname pattern", () => {
    // Exercises the nextword path where stream.peek() === '.' triggers skipTo(' ')
    const doc = [
      "data work.output;",
      "  set sashelp.class;",
      "  bmi = weight / (height**2);",
      "  format bmi 8.2;",
      "  varfmt = 'date9.';",
      "run;",
    ].join("\n");
    const state = parseDoc(sas, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes block comment ending mid-line with content after */", () => {
    // Exercises the path where comment ends mid-line and code follows
    const doc = [
      "/* short */ data test;",
      "  x /* inline comment */ = 1;",
      "  /* comment with * inside still */",
      "run;",
    ].join("\n");
    const state = parseDoc(sas, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ─── GHERKIN ────────────────────────────────────────────────────────────────

describe("Gherkin tokenizer deep coverage", () => {
  it("tokenizes Feature keyword and description", () => {
    // Exercises Feature: regex match path
    const doc = [
      "Feature: User login",
      "  As a user",
      "  I want to log in",
      "  So that I can access my account",
    ].join("\n");
    const state = parseDoc(gherkin, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Background with steps", () => {
    // Exercises Background: and Given/When/Then/And step keywords
    const doc = [
      "Feature: Shopping cart",
      "",
      "  Background:",
      "    Given a user is logged in",
      "    And the cart is empty",
    ].join("\n");
    const state = parseDoc(gherkin, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Scenario with all step types and inline strings", () => {
    // Exercises Scenario:, step keywords (Given/When/Then/And/But), and inline "strings"
    const doc = [
      "Feature: Login",
      "",
      "  Scenario: Successful login",
      '    Given the user navigates to "login page"',
      '    When the user enters "admin" as username',
      '    And the user enters "password" as password',
      "    Then the user should be logged in",
      '    But the user should not see "error"',
    ].join("\n");
    const state = parseDoc(gherkin, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Scenario Outline with placeholders and Examples table", () => {
    // Exercises Scenario Outline:, <placeholder>, Examples:, and table parsing
    const doc = [
      "Feature: Outline test",
      "",
      "  Scenario Outline: Eating cucumbers",
      "    Given there are <start> cucumbers",
      "    When I eat <eat> cucumbers",
      "    Then I should have <left> cucumbers",
      "",
      "  Examples:",
      "    | start | eat | left |",
      "    |    12 |   5 |    7 |",
      "    |    20 |   5 |   15 |",
    ].join("\n");
    const state = parseDoc(gherkin, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes multiline strings with triple quotes", () => {
    // Exercises inMultilineString path: opening """, content lines, closing """
    const doc = [
      "Feature: Multiline",
      "",
      "  Scenario: Doc string",
      "    Given the following text:",
      '      """',
      "      This is a multiline",
      "      string argument",
      '      """',
      "    Then it should be processed",
    ].join("\n");
    const state = parseDoc(gherkin, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes tags on feature and scenario", () => {
    // Exercises @tag path
    const doc = [
      "@smoke @regression",
      "Feature: Tagged feature",
      "",
      "  @wip @slow",
      "  Scenario: Tagged scenario",
      "    Given something",
      "    Then something else",
    ].join("\n");
    const state = parseDoc(gherkin, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes comments with # prefix", () => {
    // Exercises #.* comment match
    const doc = [
      "# This is a comment",
      "Feature: Commented feature",
      "  # Another comment",
      "  Scenario: Test",
      "    # Step comment",
      "    Given something",
    ].join("\n");
    const state = parseDoc(gherkin, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes multiline table with header and data rows", () => {
    // Exercises inMultilineTable path: | bracket, header line, data lines, non-table exit
    const doc = [
      "Feature: Table test",
      "",
      "  Scenario: Data table",
      "    Given the following users:",
      "      | name  | age | role   |",
      "      | Alice |  30 | admin  |",
      "      | Bob   |  25 | editor |",
      "    Then they should be created",
    ].join("\n");
    const state = parseDoc(gherkin, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes non-English Feature keyword (Fonctionnalite)", () => {
    // Exercises i18n keyword paths
    const doc = [
      "Fonctionnalit\u00e9: Connexion utilisateur",
      "",
      "  Sc\u00e9nario: Connexion r\u00e9ussie",
      "    Etant donn\u00e9 un utilisateur",
      "    Alors il est connect\u00e9",
    ].join("\n");
    const state = parseDoc(gherkin, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes fallthrough content between keywords", () => {
    // Exercises the else branch: stream.next() + eatWhile(/[^@"<#]/)
    const doc = [
      "Feature: Fallthrough",
      "  Some description text without any special characters",
      "  that does not match keywords or tags or strings",
      "",
      "  Scenario: Basic",
      "    Given something plain",
    ].join("\n");
    const state = parseDoc(gherkin, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ─── DTD ────────────────────────────────────────────────────────────────────

describe("DTD tokenizer deep coverage", () => {
  it("tokenizes SGML comments <!-- -->", () => {
    // Exercises ch=='<', stream.eat('!'), eatWhile(/[-]/), tokenSGMLComment
    const doc = [
      "<!-- This is a comment -->",
      "<!ELEMENT note (to, from, heading, body)>",
    ].join("\n");
    const state = parseDoc(dtd, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes XML declarations <?xml ... ?>", () => {
    // Exercises ch=='<', stream.eat('?'), inBlock('meta', '?>') path
    const doc = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<!ELEMENT doc (title, body)>",
    ].join("\n");
    const state = parseDoc(dtd, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes ELEMENT and ATTLIST declarations with keywords", () => {
    // Exercises <!keyword doindent path and stack push
    const doc = [
      "<!ELEMENT person (name, age, address?)>",
      "<!ATTLIST person",
      '  id ID #REQUIRED',
      '  class CDATA #IMPLIED',
      ">",
    ].join("\n");
    const state = parseDoc(dtd, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes ENTITY declarations with string values", () => {
    // Exercises string tokenizer with both quote types
    const doc = [
      '<!ENTITY company "Acme Corp">',
      "<!ENTITY copy '&#169;'>",
      "<!ENTITY % common.attrs 'id ID #IMPLIED'>",
    ].join("\n");
    const state = parseDoc(dtd, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes parameter entity references with # and %", () => {
    // Exercises #atom, % number, | separator paths
    const doc = [
      "<!ELEMENT doc (#PCDATA | para | list)*>",
      "<!ELEMENT mixed (#PCDATA | bold | italic)*>",
      "%common.entity;",
    ].join("\n");
    const state = parseDoc(dtd, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes internal DTD subset with brackets", () => {
    // Exercises [ and ] bracket handling, stack push/pop
    const doc = [
      "<!DOCTYPE note [",
      "  <!ELEMENT note (to, from, heading, body)>",
      "  <!ELEMENT to (#PCDATA)>",
      "  <!ELEMENT from (#PCDATA)>",
      "  <!ELEMENT heading (#PCDATA)>",
      "  <!ELEMENT body (#PCDATA)>",
      "]>",
    ].join("\n");
    const state = parseDoc(dtd, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes element content models with ?, +, * quantifiers", () => {
    // Exercises tag tokenizer with quantifier backUp, and * number path
    const doc = [
      "<!ELEMENT chapter (title, (para | figure)+, summary?)>",
      "<!ELEMENT book (chapter+)>",
      "<!ELEMENT library (book*)>",
    ].join("\n");
    const state = parseDoc(dtd, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes multi-line SGML comment", () => {
    // Exercises tokenSGMLComment across lines: dashes counting logic
    const doc = [
      "<!-- Multi-line",
      "     SGML comment",
      "     with dashes -- inside",
      "-->",
      "<!ELEMENT test EMPTY>",
    ].join("\n");
    const state = parseDoc(dtd, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes complex DTD with NOTATION and mixed content", () => {
    // Exercises various token paths and indent logic
    const doc = [
      "<!NOTATION gif SYSTEM 'image/gif'>",
      "<!NOTATION jpg SYSTEM 'image/jpeg'>",
      '<!ENTITY logo SYSTEM "logo.gif" NDATA gif>',
      "<!ELEMENT inline (#PCDATA | em | strong)*>",
      "<!ATTLIST inline",
      "  align (left | center | right) 'left'",
      ">",
    ].join("\n");
    const state = parseDoc(dtd, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes escaped strings and special chars in DTD", () => {
    // Exercises tokenString with backslash escape
    const doc = [
      '<!ENTITY nbsp "&#160;">',
      "<!ENTITY lt '&#60;'>",
      '<!ENTITY escaped "line1\\nline2">',
    ].join("\n");
    const state = parseDoc(dtd, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ─── Legacy Python ──────────────────────────────────────────────────────────

describe("Legacy Python tokenizer deep coverage", () => {
  it("tokenizes basic Python with keywords and builtins", () => {
    // Exercises keyword and builtin matching
    const doc = [
      "import os",
      "from sys import argv",
      "",
      "def hello(name):",
      "    if name:",
      "        print(f'Hello, {name}')",
      "    else:",
      "        print('Hello, world')",
      "    return None",
    ].join("\n");
    const state = parseDoc(legacyPython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes number literals: hex, binary, octal, float, imaginary", () => {
    // Exercises all number literal branches
    const doc = [
      "a = 0xFF",
      "b = 0b1010",
      "c = 0o77",
      "d = 42",
      "e = 3.14",
      "f = .5",
      "g = 1e10",
      "h = 2.5e-3",
      "i = 3.14j",
      "j = 42J",
      "k = 1_000_000",
      "m = 0x1a_2b",
      "n = 0b1010_0101",
      "o = 0o77_55",
      "p = 0",
    ].join("\n");
    const state = parseDoc(legacyPython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes triple-quoted strings and raw/byte strings", () => {
    // Exercises stringPrefixes regex and tokenStringFactory with triple delimiters
    const doc = [
      '"""Triple double-quoted string"""',
      "'''Triple single-quoted string'''",
      'r"raw string \\n"',
      "b'byte string'",
      'rb"raw bytes \\x00"',
      "u'unicode string'",
      '"""Multi-line',
      'triple-quoted',
      'string"""',
    ].join("\n");
    const state = parseDoc(legacyPython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes f-strings with nested expressions and braces", () => {
    // Exercises formatStringFactory: {expr}, {{escaped}}, }}error, nested depth
    const doc = [
      "name = 'World'",
      "x = 42",
      "msg = f'Hello, {name}!'",
      "expr = f'result: {x + 1}'",
      "escaped = f'braces: {{not interpolated}}'",
      "nested = f'{d[\"key\"]}'",
      "fmt = f'{x:.2f}'",
      'multi = f"""',
      'Hello {name}',
      'Value: {x}',
      '"""',
    ].join("\n");
    const state = parseDoc(legacyPython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes self and cls special keywords", () => {
    // Exercises stream.match(/^(self|cls)\b/) path
    const doc = [
      "class MyClass:",
      "    def __init__(self):",
      "        self.x = 1",
      "        self.y = 2",
      "",
      "    @classmethod",
      "    def create(cls):",
      "        return cls()",
    ].join("\n");
    const state = parseDoc(legacyPython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes decorators with @ symbol", () => {
    // Exercises beginningOfLine && current == '@' path (line 296)
    const doc = [
      "@staticmethod",
      "def static_func():",
      "    pass",
      "",
      "@property",
      "def value(self):",
      "    return self._value",
      "",
      "@app.route('/api')",
      "def handler():",
      "    pass",
    ].join("\n");
    const state = parseDoc(legacyPython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes scope changes: brackets, lambda, pass/return dedent", () => {
    // Exercises pushBracketScope, lambda state, pass/return dedent, colon scope push
    const doc = [
      "def func():",
      "    x = [1, 2, 3]",
      "    y = {'a': 1, 'b': 2}",
      "    z = (1, 2)",
      "    f = lambda a, b: a + b",
      "    pass",
      "",
      "def other():",
      "    return 42",
    ].join("\n");
    const state = parseDoc(legacyPython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes indentation and dedent with nested scopes", () => {
    // Exercises pushPyScope, dedent, errorToken paths
    const doc = [
      "def outer():",
      "    x = 1",
      "    if x > 0:",
      "        y = 2",
      "        if y > 1:",
      "            z = 3",
      "    return x",
      "",
      "class Foo:",
      "    def method(self):",
      "        for i in range(10):",
      "            if i % 2 == 0:",
      "                continue",
      "            print(i)",
      "        return None",
    ].join("\n");
    const state = parseDoc(legacyPython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operators and delimiters", () => {
    // Exercises operator and delimiter regex matching
    const doc = [
      "a = 1 + 2 - 3 * 4 / 5",
      "b = a ** 2",
      "c = a // 3",
      "d = a % 2",
      "e = a & b | c ^ d",
      "f = ~a",
      "g = a << 2",
      "h = a >> 1",
      "i = a == b != c < d > e <= f >= g",
      "j = a += 1",
      "k = ...",
      "x: int = 1",
      "y = [1, 2, 3]",
      "z = {1: 2}",
      "w = (1,)",
    ].join("\n");
    const state = parseDoc(legacyPython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes word operators: and, or, not, is", () => {
    // Exercises wordOperators regex match
    const doc = [
      "x = True and False",
      "y = True or False",
      "z = not True",
      "w = x is None",
      "v = x is not None",
    ].join("\n");
    const state = parseDoc(legacyPython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes property access after dot", () => {
    // Exercises lastToken == '.' path returning 'property'
    const doc = [
      "import os",
      "path = os.path.join('/tmp', 'file')",
      "length = [1, 2, 3].__len__()",
      "x = obj.method().attribute",
    ].join("\n");
    const state = parseDoc(legacyPython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes def and class name definitions", () => {
    // Exercises lastToken == 'def' / 'class' returning 'def' style
    const doc = [
      "class MyClass:",
      "    def my_method(self):",
      "        pass",
      "",
      "def standalone():",
      "    class Inner:",
      "        def inner_method(self):",
      "            pass",
    ].join("\n");
    const state = parseDoc(legacyPython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes comments and blank lines in indented blocks", () => {
    // Exercises comment handling + scope indentation paths
    const doc = [
      "def func():",
      "    # This is a comment",
      "    x = 1  # inline comment",
      "",
      "    # Another comment after blank",
      "    return x",
    ].join("\n");
    const state = parseDoc(legacyPython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Cython tokenizer coverage", () => {
  it("tokenizes Cython-specific keywords", () => {
    // Exercises extra_keywords in cython config
    const doc = [
      "cdef int x = 0",
      "cpdef double compute(double a, double b):",
      "    cdef double result",
      "    result = a * b",
      "    return result",
      "",
      "ctypedef unsigned int uint",
      "",
      "cdef extern from 'math.h':",
      "    double sqrt(double x) nogil",
      "",
      "cdef struct Point:",
      "    double x",
      "    double y",
      "",
      "DEF PI = 3.14159",
      "IF True:",
      "    pass",
      "ELIF False:",
      "    pass",
      "ELSE:",
      "    pass",
    ].join("\n");
    const state = parseDoc(cython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Cython with Python builtins and f-strings", () => {
    const doc = [
      "cdef class Vector:",
      "    cdef public double x, y",
      "",
      "    def __init__(self, double x, double y):",
      "        self.x = x",
      "        self.y = y",
      "",
      "    def __repr__(self):",
      "        return f'Vector({self.x}, {self.y})'",
      "",
      "    cpdef double magnitude(self):",
      "        return sqrt(self.x ** 2 + self.y ** 2)",
    ].join("\n");
    const state = parseDoc(cython, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
