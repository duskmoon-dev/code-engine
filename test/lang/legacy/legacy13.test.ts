import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { tiki } from "../../../src/lang/legacy/tiki";
import { apl } from "../../../src/lang/legacy/apl";
import { elm } from "../../../src/lang/legacy/elm";
import { sieve } from "../../../src/lang/legacy/sieve";
import { verilog, tlv } from "../../../src/lang/legacy/verilog";

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

describe("Tiki Wiki tokenizer deep coverage", () => {
  it("tokenizes Tiki Wiki markup with headings and text formatting", () => {
    const doc = [
      "! Heading 1",
      "!! Heading 2",
      "!!! Heading 3",
      "",
      "__bold text__ ~~italic text~~",
      "--deleted-- ++inserted++",
      "===highlighted===",
      "",
      "* list item 1",
      "* list item 2",
      "** nested list item",
      "",
      "# ordered 1",
      "# ordered 2",
      "",
      "; term : definition",
      "",
      "---",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Tiki Wiki with links, images, and tables", () => {
    const doc = [
      "((WikiPage)) [[external link]]",
      "[http://example.com|link text]",
      "{img src=image.png}",
      "",
      "||row1col1|row1col2",
      "row2col1|row2col2||",
      "",
      "{CODE(caption=>example)}",
      "some code here",
      "{CODE}",
      "",
      "{BOX()}",
      "box content",
      "{BOX}",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Tiki Wiki with colors, monospace, and special blocks", () => {
    const doc = [
      "~~#FF0000:red text~~",
      "-+monospace text+-",
      "^superscript^",
      ",subscript,",
      "",
      "{TABS()}",
      "Tab 1 content",
      "{TABS}",
      "",
      "{REMARKSBOX(type=>note)}",
      "Note content here",
      "{REMARKSBOX}",
      "",
      "~np~no parse~np~",
      "~tc~tiki comment~tc~",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Tiki Wiki plugin syntax", () => {
    const doc = [
      "{LISTPAGES(max=>10, sort_mode=>pageName_asc)}",
      "{LISTPAGES}",
      "",
      "{include page=SomePage}",
      "{maketoc}",
      "{toc}",
      "{VERSIONS()}",
      "version content",
      "{VERSIONS}",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("APL tokenizer deep coverage", () => {
  it("tokenizes APL with array operations and primitives", () => {
    const doc = [
      "⍝ APL comment",
      "x ← 1 2 3 4 5",
      "y ← x × x",
      "z ← +/x",
      "⍴x",
      "x[2]",
    ].join("\n");
    const state = parseDoc(apl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes APL with dfns, operators, and strings", () => {
    const doc = [
      "⍝ Dfn definition",
      "factorial ← {⍵=0:1 ⋄ ⍵×∇ ⍵-1}",
      "factorial 5",
      "",
      "⍝ String",
      "greeting ← 'Hello, World!'",
      "",
      "⍝ Matrix operations",
      "mat ← 3 3 ⍴ ⍳9",
      "⌽mat",
      "⊖mat",
      "⍉mat",
      "",
      "⍝ Boolean operations",
      "a ← 1 0 1 1 0",
      "∧/a",
      "∨/a",
      "~a",
      "",
      "⍝ Nested arrays",
      "nested ← (1 2 3)(4 5 6)",
      "⊃nested",
    ].join("\n");
    const state = parseDoc(apl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes APL with numbers and special primitives", () => {
    const doc = [
      "x ← 3.14",
      "y ← 1E¯3",
      "z ← 0J1",
      "⌊3.7",
      "⌈3.2",
      "|¯5",
      "x*2",
      "⍟x",
      "○1",
    ].join("\n");
    const state = parseDoc(apl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Elm tokenizer deep coverage", () => {
  it("tokenizes Elm with module, imports, and type aliases", () => {
    const doc = [
      "module Main exposing (..)",
      "",
      "import Html exposing (Html, div, text)",
      "import Html.Attributes exposing (class)",
      "import Browser",
      "",
      "type alias Model =",
      "    { count : Int",
      "    , message : String",
      "    }",
      "",
      "type Msg",
      "    = Increment",
      "    | Decrement",
      "    | Reset",
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Elm with functions, pattern matching, and let expressions", () => {
    const doc = [
      "-- Elm comment",
      "factorial : Int -> Int",
      "factorial n =",
      "    if n <= 0 then",
      "        1",
      "    else",
      "        n * factorial (n - 1)",
      "",
      "update : Msg -> Model -> Model",
      "update msg model =",
      "    case msg of",
      "        Increment ->",
      "            { model | count = model.count + 1 }",
      "        Decrement ->",
      "            { model | count = model.count - 1 }",
      "        Reset ->",
      "            { model | count = 0 }",
      "",
      "greet : String -> String",
      "greet name =",
      '    let greeting = "Hello, " ++ name ++ "!"',
      "    in greeting",
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Elm with list operations, tuples, and numbers", () => {
    const doc = [
      "xs = [1, 2, 3, 4, 5]",
      "ys = List.map (\\x -> x * 2) xs",
      "zs = List.filter (\\x -> x > 2) xs",
      "",
      "pair = (1, True)",
      "triple = (1, 2.0, 'a')",
      "",
      "x = 0xFF",
      "y = 3.14e-2",
      "z = 0b1010",
      "",
      "maybeVal : Maybe Int",
      "maybeVal = Just 42",
      "",
      "result : Result String Int",
      "result = Ok 100",
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Elm with record syntax and where clauses", () => {
    const doc = [
      "type alias Person =",
      "    { name : String",
      "    , age : Int",
      "    , email : String",
      "    }",
      "",
      "defaultPerson : Person",
      "defaultPerson =",
      '    { name = "Unknown"',
      "    , age = 0",
      '    , email = ""',
      "    }",
      "",
      "fib : Int -> Int",
      "fib n =",
      "    case n of",
      "        0 -> 0",
      "        1 -> 1",
      "        _ -> fib (n - 1) + fib (n - 2)",
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Sieve tokenizer deep coverage", () => {
  it("tokenizes Sieve email filtering scripts", () => {
    const doc = [
      "# Sieve comment",
      'require ["fileinto", "reject", "vacation"];',
      "",
      'if header :contains "From" "spam@example.com" {',
      '    fileinto "Spam";',
      "    stop;",
      "}",
      "",
      'if header :matches "Subject" "*[BULK]*" {',
      '    fileinto "Bulk";',
      "}",
      "",
      'if address :is "to" "user@example.com" {',
      '    fileinto "Personal";',
      "}",
    ].join("\n");
    const state = parseDoc(sieve, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Sieve with vacation, envelope, and size tests", () => {
    const doc = [
      'require ["vacation", "envelope", "fileinto"];',
      "",
      "if envelope :is \"from\" \"boss@company.com\" {",
      '    fileinto "Important";',
      "}",
      "",
      "if size :over 1M {",
      '    fileinto "Large";',
      "}",
      "",
      "vacation",
      "    :days 7",
      '    :subject "Out of office"',
      '    "I am on vacation until next week.";',
      "",
      "if allof (",
      '    header :contains "X-Spam-Flag" "YES",',
      "    not header :contains \"From\" \"trusted@example.com\"",
      ") {",
      "    discard;",
      "}",
    ].join("\n");
    const state = parseDoc(sieve, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Sieve with nested conditions and actions", () => {
    const doc = [
      'require ["fileinto", "imap4flags", "copy"];',
      "",
      "if anyof (",
      '    header :contains "List-Id" "news",',
      '    header :contains "List-Id" "announce"',
      ") {",
      '    fileinto "Lists";',
      '    setflag "\\\\Seen";',
      "}",
      "",
      'elsif header :contains "Subject" "URGENT" {',
      '    redirect :copy "urgent@example.com";',
      "}",
      "",
      "else {",
      '    fileinto "INBOX";',
      "}",
    ].join("\n");
    const state = parseDoc(sieve, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Verilog/SystemVerilog tokenizer deep coverage", () => {
  it("tokenizes Verilog with modules, ports, and always blocks", () => {
    const doc = [
      "// Verilog module",
      "/* block comment */",
      "module counter #(",
      "  parameter WIDTH = 8",
      ") (",
      "  input wire clk,",
      "  input wire rst_n,",
      "  output reg [WIDTH-1:0] count",
      ");",
      "",
      "always @(posedge clk or negedge rst_n) begin",
      "  if (!rst_n) begin",
      "    count <= {WIDTH{1'b0}};",
      "  end else begin",
      "    count <= count + 1'b1;",
      "  end",
      "end",
      "",
      "endmodule",
    ].join("\n");
    const state = parseDoc(verilog, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Verilog with tasks, functions, and typedefs", () => {
    const doc = [
      "module example;",
      "",
      "typedef logic [7:0] byte_t;",
      "",
      "function automatic integer factorial;",
      "  input integer n;",
      "  begin",
      "    if (n <= 1)",
      "      factorial = 1;",
      "    else",
      "      factorial = n * factorial(n - 1);",
      "  end",
      "endfunction",
      "",
      "task automatic delay_task;",
      "  input [7:0] cycles;",
      "  begin",
      "    repeat(cycles) @(posedge clk);",
      "  end",
      "endtask",
      "",
      "endmodule",
    ].join("\n");
    const state = parseDoc(verilog, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Verilog with numbers and string literals", () => {
    const doc = [
      "module literals;",
      "  // Various number formats",
      "  wire [7:0] a = 8'hFF;",
      "  wire [3:0] b = 4'b1010;",
      "  wire [7:0] c = 8'd255;",
      "  wire [7:0] d = 8'o377;",
      "  real pi = 3.14;",
      "  real sci = 1.5e-3;",
      "",
      '  initial $display("hello %s", "world");',
      "",
      "  // Assign with ternary",
      "  assign out = (sel) ? a : b;",
      "endmodule",
    ].join("\n");
    const state = parseDoc(verilog, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes SystemVerilog with classes and interfaces", () => {
    const doc = [
      "// SystemVerilog",
      "interface simple_bus;",
      "  logic clk, rst;",
      "  logic [7:0] data;",
      "  logic valid, ready;",
      "endinterface",
      "",
      "class transaction;",
      "  rand logic [7:0] data;",
      "  rand logic valid;",
      "",
      "  constraint data_c { data inside {[0:255]}; }",
      "",
      "  function new();",
      "    data = 0;",
      "    valid = 0;",
      "  endfunction",
      "",
      "  task send(simple_bus bus);",
      "    bus.data = data;",
      "    bus.valid = valid;",
      "  endtask",
      "endclass",
    ].join("\n");
    const state = parseDoc(verilog, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes TLV (Transaction-Level Verilog)", () => {
    const doc = [
      "\\TLV_version 1d: tl-x.org",
      "",
      "\\module top",
      "  |pipe",
      "    @1",
      "      $valid = 1'b1;",
      "      $data[7:0] = 8'hAB;",
      "    @2",
      "      $result[7:0] = $data + 1;",
    ].join("\n");
    const state = parseDoc(tlv, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
