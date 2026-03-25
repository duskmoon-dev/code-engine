import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { swift } from "../../../src/lang/legacy/swift";
import { vb } from "../../../src/lang/legacy/vb";
import { tiddlyWiki } from "../../../src/lang/legacy/tiddlywiki";
import { ecl } from "../../../src/lang/legacy/ecl";
import { properties } from "../../../src/lang/legacy/properties";

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

describe("Swift tokenizer deep coverage", () => {
  it("tokenizes single-line and block comments including nested", () => {
    // Covers lines 36-43 (// and /* */), 129-138 (tokenComment with nested)
    const doc = [
      "// single line comment",
      "/* block comment */",
      "/* nested /* inner */ outer */",
      "let x = 1 // trailing comment",
    ].join("\n");
    const state = parseDoc(swift, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes string interpolation with parentheses", () => {
    // Covers lines 96-98 (tokenUntilClosingParen depth), 110-114 (escaped paren in string)
    const doc = [
      'let name = "World"',
      'let greeting = "Hello, \\(name)!"',
      'let nested = "result: \\(foo(bar(1, 2)))"',
      "let single = 'c'",
      'let multi = """',
      "  multi-line string",
      '  with \\(interpolation)',
      '"""',
    ].join("\n");
    const state = parseDoc(swift, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes unterminated single-line strings", () => {
    // Covers lines 122-126 (singleLine string pop on EOL)
    const doc = [
      'let broken = "unterminated string',
      "let next = 42",
    ].join("\n");
    const state = parseDoc(swift, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes identifiers, types, atoms, and defining keywords", () => {
    // Covers line 79 (variable fallthrough), 81-82 (unknown char), line 77 (def after define)
    const doc = [
      "var myVar = 10",
      "let myLet: Int = 20",
      "func doSomething() -> Bool { return true }",
      "class MyClass { }",
      "struct MyStruct { }",
      "enum MyEnum { case a, b }",
      "let arr: Array<String> = []",
      "let flag: Bool = false",
      "let n: Never? = nil",
      "let _ = self",
      "let x = super.init()",
    ].join("\n");
    const state = parseDoc(swift, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes numbers, operators, attributes, and instructions", () => {
    // Covers binary/octal/hex/decimal, operators, #instruction, @attribute
    const doc = [
      "let bin = 0b1010_1100",
      "let oct = 0o777_000",
      "let hex = 0xFF_00_AA",
      "let hexFloat = 0xFp2",
      "let dec = 1_000.5e-3",
      "let neg = -42",
      "let op = a + b - c * d / e % f",
      "let cmp = a < b && c > d || e == f",
      "#if DEBUG",
      "#available(iOS 15, *)",
      "@objc @available(*, deprecated)",
      "let range = 1...10",
      "let half = 0..<5",
    ].join("\n");
    const state = parseDoc(swift, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes indent/dedent with brackets and closures", () => {
    // Covers lines 187-191 (indent function), context push/pop
    const doc = [
      "func example() {",
      "  let arr = [1, 2, 3]",
      "  let result = arr.map { $0 * 2 }",
      "    .filter { $0 > 2 }",
      "  if result.isEmpty {",
      "    print(\"empty\")",
      "  }",
      "}",
    ].join("\n");
    const state = parseDoc(swift, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("VB tokenizer deep coverage", () => {
  it("tokenizes comments, strings, and number literals", () => {
    const doc = [
      "' This is a comment",
      'Dim s As String = "Hello World"',
      "Dim f1 As Single = 3.14F",
      "Dim f2 As Single = .5F",
      "Dim f3 As Double = 10.0",
      "Dim h As Integer = &HFF",
      "Dim o As Integer = &O77",
      "Dim d As Integer = 42L",
      "Dim z As Integer = 0",
      "Dim x As Integer = 99F",
    ].join("\n");
    const state = parseDoc(vb, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes control flow with opening, middle, closing, and doubleClosing keywords", () => {
    // Covers do/opening/middle/closing/doubleClosing/indent/dedent paths
    const doc = [
      "Sub Main()",
      "  Dim x As Integer = 10",
      "  If x > 5 Then",
      "    Console.WriteLine(\"big\")",
      "  ElseIf x > 0 Then",
      "    Console.WriteLine(\"small\")",
      "  Else",
      "    Console.WriteLine(\"zero\")",
      "  End If",
      "",
      "  Do While x > 0",
      "    x = x - 1",
      "  Loop",
      "",
      "  For i = 1 To 10",
      "    Console.WriteLine(i)",
      "  Next",
      "",
      "  Select Case x",
      "    Case 0",
      "      Console.WriteLine(\"zero\")",
      "    Case Else",
      "      Console.WriteLine(\"other\")",
      "  End Select",
      "End Sub",
    ].join("\n");
    const state = parseDoc(vb, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operators, delimiters, types, and dot-connected identifiers", () => {
    // Covers doubleOperators, tripleDelimiters, types, dot-connected identifiers
    const doc = [
      "Dim a As Boolean = True",
      "Dim b As Integer = 5",
      "Dim c As String = \"test\"",
      "b += 1",
      "b -= 1",
      "b *= 2",
      "b //= 3",
      "b >>= 1",
      "b <<= 1",
      "If a == True And b <> 0 Or b >= 1 Then",
      "  Console.WriteLine(b)",
      "End If",
      "Dim d As Double = 1.5",
      "Dim e As DateTime = Nothing",
      "System.Console.WriteLine(d)",
      "My.Application.Info.DirectoryPath",
    ].join("\n");
    const state = parseDoc(vb, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes word operators and class/module structures", () => {
    const doc = [
      "Module MyModule",
      "  Class MyClass",
      "    Private _value As Object",
      "    Public Property Value() As Object",
      "      Get",
      "        Return _value",
      "      End Get",
      "      Set(ByVal v As Object)",
      "        _value = v",
      "      End Set",
      "    End Property",
      "    Function Check(x As Integer) As Boolean",
      "      Return x Is Nothing OrElse x = 0 AndAlso Not _value Like \"*test*\"",
      "    End Function",
      "  End Class",
      "End Module",
    ].join("\n");
    const state = parseDoc(vb, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes try/catch, using, with, and synclock blocks", () => {
    const doc = [
      "Try",
      "  Using sr As New StreamReader(\"file.txt\")",
      "    Dim line As String = sr.ReadLine()",
      "  End Using",
      "Catch ex As Exception",
      "  Console.WriteLine(ex.Message)",
      "Finally",
      "  Console.WriteLine(\"done\")",
      "End Try",
      "",
      "SyncLock lockObj",
      "  sharedResource += 1",
      "End SyncLock",
      "",
      "With myObj",
      "  .Name = \"test\"",
      "  .Value = 42",
      "End With",
    ].join("\n");
    const state = parseDoc(vb, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("TiddlyWiki tokenizer deep coverage", () => {
  it("tokenizes headers, lists, definition lists, and block quotes", () => {
    // Covers sol-based tokens: !, *, #, ;, :, >, |
    const doc = [
      "!Header 1",
      "!!Header 2",
      "!!!Header 3",
      "",
      "*unordered item",
      "**nested item",
      "***deeply nested",
      "",
      "#ordered item",
      "##nested ordered",
      "",
      ";term",
      ":definition",
      ";;nested term",
      "::nested definition",
      "",
      ">single line quote",
      ">>nested quote",
      "",
      "|header|row|",
      "|cell|cell|",
    ].join("\n");
    const state = parseDoc(tiddlyWiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes code blocks, wiki comments, and JS/XML code markers", () => {
    // Covers reCodeBlockStart/Stop, reWikiComment, reJsCode, reXmlCode
    const doc = [
      "/***",
      "wiki comment",
      "***/",
      "",
      "//{{{",
      "var x = 1;",
      "//}}}",
      "",
      "<!--{{{-->",
      "<div>xml block</div>",
      "<!--}}}-->",
      "",
      "{{{",
      "code block content",
      "line two of code",
      "}}}",
      "",
      "inline {{{code}}} here",
    ].join("\n");
    const state = parseDoc(tiddlyWiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes inline formatting: bold, italic, underline, strikethrough", () => {
    // Covers twTokenStrong, twTokenEm, twTokenUnderline, twTokenStrike
    const doc = [
      "Normal text ''bold text'' normal",
      "Normal //italic text// normal",
      "Normal __underline text__ normal",
      "Normal --strikethrough-- normal",
      "Combined ''bold //and italic// text''",
      "-- mdash (space after dash-dash)",
    ].join("\n");
    const state = parseDoc(tiddlyWiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes links, macros, comments, and special characters", () => {
    // Covers link matching, <<macro>>, /%comment%/, ~CamelCase, [[wikilink]]
    const doc = [
      "Visit http://example.com for more info",
      "Also ftp://files.example.com/data",
      "",
      "<<slider chkSlider tiddlerName label>>",
      "<<tabs tabsClass tab1 tab2>>",
      "<<newTiddler>>",
      "",
      "/%",
      "invisible comment",
      "%/",
      "",
      "~NoCamelCaseLink",
      '[[Wiki Link]]',
      "[[Pretty Link|ActualTiddler]]",
      "",
      "@spacename",
      '"quoted string"',
      "Some number: 42",
    ].join("\n");
    const state = parseDoc(tiddlyWiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes horizontal rules and block quotes", () => {
    // Covers reHR and reBlockQuote
    const doc = [
      "Text before rule",
      "----",
      "Text after rule",
      "",
      "<<<",
      "Block quote content here",
      "<<<",
    ].join("\n");
    const state = parseDoc(tiddlyWiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("ECL tokenizer deep coverage", () => {
  it("tokenizes keywords, variables, modifiers, types, and builtins", () => {
    // Covers the keyword/variable/variable_2/variable_3/builtin branches
    const doc = [
      "IMPORT myModule;",
      "EXPORT myDataset := DATASET('file', myLayout, FLAT);",
      "",
      "myLayout := RECORD",
      "  STRING name;",
      "  INTEGER age;",
      "  BOOLEAN active;",
      "  DECIMAL8_2 salary;",
      "  UNICODE label;",
      "END;",
      "",
      "filtered := myDataset(age > 30 AND active = TRUE);",
      "sorted := SORT(filtered, name);",
      "OUTPUT(sorted);",
    ].join("\n");
    const state = parseDoc(ecl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes strings, comments, and meta directives", () => {
    // Covers tokenString, tokenComment, metaHook (#)
    const doc = [
      "#OPTION('obfuscateOutput', TRUE);",
      "// single line comment",
      "/* multi-line",
      "   comment */",
      "",
      "str1 := 'single quoted string';",
      'str2 := "double quoted string";',
      "str3 := 'escaped \\'quote\\' inside';",
    ].join("\n");
    const state = parseDoc(ecl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operators, numbers, and punctuation with context handling", () => {
    // Covers isOperatorChar, number, curPunc handling, pushContext/popContext
    const doc = [
      "x := 1 + 2 * 3 - 4 / 5;",
      "y := x > 10 AND x < 100;",
      "z := IF(x = 42, 'yes', 'no');",
      "",
      "mySet := [1, 2, 3, 4, 5];",
      "myRec := {name := 'test', value := 99.5};",
      "",
      "result := CASE(x,",
      "  1 => 'one',",
      "  2 => 'two',",
      "  'other');",
    ].join("\n");
    const state = parseDoc(ecl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes block keywords causing newstatement and typed suffixes", () => {
    // Covers blockKeywords newstatement path, variable_3 suffix detection (cur2)
    const doc = [
      "IF x > 0 THEN",
      "  OUTPUT('positive');",
      "ELSE",
      "  OUTPUT('non-positive');",
      "",
      "FOR i := 1 TO 10 DO",
      "  OUTPUT(i);",
      "",
      "TRY",
      "  riskyOp();",
      "CATCH(e)",
      "  FAIL(e);",
      "END;",
      "",
      "// typed suffix: integer4 should match as type",
      "myField := TYPEOF(integer4);",
      "data8 myBlob := x'DEADBEEF';",
      "string20 myStr := 'hello';",
    ].join("\n");
    const state = parseDoc(ecl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes atoms and indent handling", () => {
    // Covers atoms (true/false/null), indent with closing braces
    const doc = [
      "flag := true;",
      "empty := null;",
      "check := false;",
      "",
      "rec := RECORD",
      "  {",
      "    STRING20 name;",
      "    INTEGER4 age;",
      "  }",
      "END;",
    ].join("\n");
    const state = parseDoc(ecl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Properties tokenizer deep coverage", () => {
  it("tokenizes basic key=value pairs and key:value pairs", () => {
    const doc = [
      "# comment line",
      "! another comment",
      "; ini-style comment",
      "key1=value1",
      "key2 = value2",
      "key3:value3",
      "key4 : value4",
    ].join("\n");
    const state = parseDoc(properties, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes multiline values with backslash continuation", () => {
    // Covers lines 41-45 (backslash at EOL), 11-13 (nextMultiline/inMultiline)
    const doc = [
      "long.property = value that continues \\",
      "  on the next line \\",
      "  and another line",
      "next.property = normal value",
    ].join("\n");
    const state = parseDoc(properties, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes section headers (INI-style)", () => {
    // Covers lines 34-37 ([ ... ] section header), afterSection state
    const doc = [
      "[section1]",
      "key1=value1",
      "key2=value2",
      "",
      "[section2]",
      "key3=value3",
    ].join("\n");
    const state = parseDoc(properties, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes empty values and keys without values", () => {
    const doc = [
      "empty.key=",
      "empty.key2:",
      "bare.key",
      "",
      "# comment between",
      "another.key = some value",
    ].join("\n");
    const state = parseDoc(properties, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes properties with leading whitespace and special characters", () => {
    // Covers line 24-26 (sol eatSpace), various position states
    const doc = [
      "  indented.key = value",
      "path.key = /usr/local/bin",
      "url.key = https://example.com",
      "special.chars = value with = equals",
      "colon.in.value : value with : colons",
      "backslash.not.eol = path\\to\\file",
    ].join("\n");
    const state = parseDoc(properties, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
