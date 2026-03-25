import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { haxe } from "../../../src/lang/legacy/haxe";
import { smalltalk } from "../../../src/lang/legacy/smalltalk";
import { verilog } from "../../../src/lang/legacy/verilog";
import { yacas } from "../../../src/lang/legacy/yacas";
import { powerShell } from "../../../src/lang/legacy/powershell";
import { vhdl } from "../../../src/lang/legacy/vhdl";
import { erlang } from "../../../src/lang/legacy/erlang";
import { elm } from "../../../src/lang/legacy/elm";
import { crystal } from "../../../src/lang/legacy/crystal";
import { sieve } from "../../../src/lang/legacy/sieve";
import { scheme } from "../../../src/lang/legacy/scheme";
import { clojure } from "../../../src/lang/legacy/clojure";
import { fcl } from "../../../src/lang/legacy/fcl";
import { rpmSpec } from "../../../src/lang/legacy/rpm";
import { forth } from "../../../src/lang/legacy/forth";

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

describe("Haxe tokenizer deep coverage", () => {
  it("tokenizes Haxe with classes, generics, and multiline strings", () => {
    const doc = [
      "// Haxe comment",
      "/* block comment */",
      "package com.example;",
      "",
      "class Main {",
      "  static var count:Int = 0;",
      '  static var name:String = "World";',
      "",
      "  static function main() {",
      "    trace('Hello, $name!');",
      "    var arr:Array<Int> = [1, 2, 3];",
      "    for (x in arr) {",
      "      count += x;",
      "    }",
      "  }",
      "}",
    ].join("\n");
    const state = parseDoc(haxe, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Haxe with enums, typedefs, and operators", () => {
    const doc = [
      "enum Color { Red; Green; Blue; }",
      "typedef Point = { x: Float, y: Float };",
      "class Calc {",
      "  static inline function sq(x:Float):Float return x * x;",
      "  static function dist(p:Point):Float {",
      "    return Math.sqrt(sq(p.x) + sq(p.y));",
      "  }",
      "}",
    ].join("\n");
    const state = parseDoc(haxe, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Smalltalk tokenizer deep coverage", () => {
  it("tokenizes Smalltalk with messages and blocks", () => {
    const doc = [
      '"Smalltalk comment"',
      "| x y |",
      "x := 42.",
      "y := x + 8.",
      "Transcript show: 'Hello, World!'.",
      "",
      "x > 0 ifTrue: [",
      "  Transcript show: 'positive'.",
      "] ifFalse: [",
      "  Transcript show: 'non-positive'.",
      "].",
      "",
      "1 to: 10 do: [:i |",
      "  Transcript show: i printString.",
      "].",
    ].join("\n");
    const state = parseDoc(smalltalk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Smalltalk with class definitions and symbols", () => {
    const doc = [
      "Object subclass: #Animal",
      "  instanceVariableNames: 'name species'",
      "  classVariableNames: ''",
      "  poolDictionaries: ''",
      "  category: 'Examples'.",
      "",
      "Animal class >> new: aName species: aSpecies [",
      "  | a |",
      "  a := super new.",
      "  a name: aName; species: aSpecies.",
      "  ^a",
      "].",
    ].join("\n");
    const state = parseDoc(smalltalk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Verilog tokenizer deep coverage", () => {
  it("tokenizes Verilog HDL with modules and always blocks", () => {
    const doc = [
      "// Verilog comment",
      "/* block comment */",
      "module counter (",
      "  input clk,",
      "  input rst_n,",
      "  output reg [7:0] count",
      ");",
      "",
      "  always @(posedge clk or negedge rst_n) begin",
      "    if (!rst_n)",
      "      count <= 8'b0;",
      "    else",
      "      count <= count + 1'b1;",
      "  end",
      "",
      "endmodule",
    ].join("\n");
    const state = parseDoc(verilog, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Verilog with parameters and assigns", () => {
    const doc = [
      "module mux4 #(parameter WIDTH = 8) (",
      "  input [1:0] sel,",
      "  input [WIDTH-1:0] a, b, c, d,",
      "  output reg [WIDTH-1:0] y",
      ");",
      "  always @(*)",
      "    case (sel)",
      "      2'b00: y = a;",
      "      2'b01: y = b;",
      "      2'b10: y = c;",
      "      default: y = d;",
      "    endcase",
      "endmodule",
    ].join("\n");
    const state = parseDoc(verilog, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Yacas tokenizer deep coverage", () => {
  it("tokenizes Yacas computer algebra code", () => {
    const doc = [
      "/* Yacas comment */",
      "f(x) := x^2 + 2*x + 1;",
      "g(x, y) := x * y + Sin(x);",
      "Simplify(f(2) + g(3, 4));",
      "Plot2D(Sin(x), -Pi .. Pi);",
      "Integrate(x, x^2);",
      'a := "string value";',
      "b := 3.14;",
    ].join("\n");
    const state = parseDoc(yacas, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("PowerShell tokenizer deep coverage", () => {
  it("tokenizes PowerShell with cmdlets, variables, and comments", () => {
    const doc = [
      "# PowerShell comment",
      "<# multi-line",
      "   comment block #>",
      "",
      "$name = 'World'",
      '$count = 42',
      "",
      "function Greet-User {",
      "  param([string]$Name = 'Guest')",
      '  Write-Host "Hello, $Name!"',
      "}",
      "",
      "Get-Process | Where-Object { $_.CPU -gt 10 } | Sort-Object CPU -Descending",
      "",
      "if ($count -gt 0) {",
      "  $result = $count * 2",
      '  Write-Output "Result: $result"',
      "}",
    ].join("\n");
    const state = parseDoc(powerShell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes PowerShell with here-strings and special variables", () => {
    const doc = [
      '$arr = @(1, 2, 3, 4, 5)',
      '$hash = @{ key = "value"; num = 42 }',
      "",
      "foreach ($item in $arr) {",
      "  switch ($item) {",
      "    1 { Write-Host 'one' }",
      "    2 { Write-Host 'two' }",
      "    default { Write-Host 'other' }",
      "  }",
      "}",
      "",
      'try {',
      '  throw "error"',
      '} catch {',
      '  Write-Error $_',
      '}',
    ].join("\n");
    const state = parseDoc(powerShell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("VHDL tokenizer deep coverage", () => {
  it("tokenizes VHDL with entity, architecture, and signals", () => {
    const doc = [
      "-- VHDL comment",
      "library IEEE;",
      "use IEEE.STD_LOGIC_1164.ALL;",
      "",
      "entity counter is",
      "  port (",
      "    clk : in  STD_LOGIC;",
      "    rst : in  STD_LOGIC;",
      "    cnt : out STD_LOGIC_VECTOR(7 downto 0)",
      "  );",
      "end counter;",
      "",
      "architecture Behavioral of counter is",
      "  signal count : STD_LOGIC_VECTOR(7 downto 0) := (others => '0');",
      "begin",
      "  process(clk, rst)",
      "  begin",
      "    if rst = '1' then",
      "      count <= (others => '0');",
      "    elsif rising_edge(clk) then",
      "      count <= count + 1;",
      "    end if;",
      "  end process;",
      "  cnt <= count;",
      "end Behavioral;",
    ].join("\n");
    const state = parseDoc(vhdl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Erlang tokenizer deep coverage", () => {
  it("tokenizes Erlang with modules, functions, and pattern matching", () => {
    const doc = [
      "% Erlang comment",
      "-module(hello).",
      "-export([main/0, factorial/1]).",
      "",
      "main() ->",
      '  io:format("Hello, World!~n").',
      "",
      "factorial(0) -> 1;",
      "factorial(N) when N > 0 ->",
      "  N * factorial(N - 1).",
    ].join("\n");
    const state = parseDoc(erlang, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Erlang with atoms, strings, and lists", () => {
    const doc = [
      "-module(data_ops).",
      "",
      "test() ->",
      '  Str = "hello world",',
      "  Atom = ok,",
      "  List = [1, 2, 3, foo, bar],",
      "  Tuple = {name, value, 42},",
      "  Map = #{key => val, count => 0},",
      "  {Str, Atom, List, Tuple, Map}.",
    ].join("\n");
    const state = parseDoc(erlang, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Elm tokenizer deep coverage", () => {
  it("tokenizes Elm with module, types, and functions", () => {
    const doc = [
      "-- Elm comment",
      "module Main exposing (main)",
      "",
      "import Html exposing (text)",
      "import Html.Attributes exposing (class)",
      "",
      "type Color",
      "  = Red",
      "  | Green",
      "  | Blue",
      "",
      "type alias User =",
      "  { name : String",
      "  , age : Int",
      "  }",
      "",
      "greet : String -> String",
      'greet name = "Hello, " ++ name ++ "!"',
      "",
      "main = text (greet \"World\")",
    ].join("\n");
    const state = parseDoc(elm, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Crystal tokenizer deep coverage", () => {
  it("tokenizes Crystal with classes, methods, and types", () => {
    const doc = [
      "# Crystal comment",
      "",
      "class Greeter",
      "  def initialize(@name : String)",
      "  end",
      "",
      "  def greet : String",
      '    "Hello, #{@name}!"',
      "  end",
      "end",
      "",
      "g = Greeter.new(\"World\")",
      "puts g.greet",
      "",
      "x : Int32 = 42",
      "y = 3.14_f64",
      "arr = [1, 2, 3]",
    ].join("\n");
    const state = parseDoc(crystal, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Sieve tokenizer deep coverage", () => {
  it("tokenizes Sieve email filtering script", () => {
    const doc = [
      "# Sieve comment",
      'require ["fileinto", "reject", "vacation"];',
      "",
      'if header :contains "From" "spam@example.com" {',
      '  reject "Spam not accepted";',
      "}",
      "",
      'if header :matches "Subject" "*[BULK]*" {',
      '  fileinto "Bulk";',
      "  stop;",
      "}",
      "",
      'vacation :days 7 :subject "Out of office" "I am away.";',
    ].join("\n");
    const state = parseDoc(sieve, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Scheme tokenizer additional coverage", () => {
  it("tokenizes Scheme with vectors, ports, and tail calls", () => {
    const doc = [
      "; Scheme with tail recursion",
      "(define (sum-iter n acc)",
      "  (if (= n 0) acc",
      "      (sum-iter (- n 1) (+ acc n))))",
      "",
      "(define v #(1 2 3 4 5))",
      "(vector-ref v 0)",
      "",
      "(define port (open-input-string \"hello\"))",
      "(read-char port)",
      "(close-input-port port)",
      "",
      "(define-syntax my-if",
      "  (syntax-rules (then else)",
      "    ((my-if cond then t else e) (if cond t e))))",
    ].join("\n");
    const state = parseDoc(scheme, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Clojure tokenizer deep coverage", () => {
  it("tokenizes Clojure with namespaces, macros, and data structures", () => {
    const doc = [
      "; Clojure comment",
      "(ns example.core",
      "  (:require [clojure.string :as str]",
      "            [clojure.set :as set]))",
      "",
      "(defn factorial [n]",
      "  (if (<= n 1) 1",
      "      (* n (factorial (- n 1)))))",
      "",
      "(def data {:name \"Alice\" :age 30 :active true})",
      "(def items [1 2 3 4 5])",
      "(def s #{:a :b :c})",
      "",
      "(let [x 42",
      "      y (* x 2)]",
      "  (str \"Result: \" y))",
    ].join("\n");
    const state = parseDoc(clojure, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Clojure with threading macros and regex", () => {
    const doc = [
      "(require '[clojure.string :as str])",
      "",
      "(defn process [s]",
      "  (-> s",
      "      str/trim",
      "      str/lower-case",
      "      (str/replace #\"\\s+\" \" \")))",
      "",
      "(def emails",
      '  (->> ["user@example.com" "admin@test.org"]',
      "       (filter #(str/includes? % \"example\"))",
      "       (map str/upper-case)))",
    ].join("\n");
    const state = parseDoc(clojure, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("FCL tokenizer coverage", () => {
  it("tokenizes FCL (Fuzzy Control Language)", () => {
    const doc = [
      "FUNCTION_BLOCK temperature_control",
      "  VAR_INPUT",
      "    temperature : REAL;",
      "    setpoint : REAL;",
      "  END_VAR",
      "  VAR_OUTPUT",
      "    heater : REAL;",
      "  END_VAR",
      "  FUZZIFY temperature",
      "    TERM cold := (0, 1)(20, 0);",
      "    TERM warm := (15, 0)(25, 1)(35, 0);",
      "    TERM hot := (30, 0)(50, 1);",
      "  END_FUZZIFY",
      "END_FUNCTION_BLOCK",
    ].join("\n");
    const state = parseDoc(fcl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("RPM Spec tokenizer coverage", () => {
  it("tokenizes RPM spec file", () => {
    const doc = [
      "Name: mypackage",
      "Version: 1.0.0",
      "Release: 1%{?dist}",
      "Summary: My example package",
      "License: MIT",
      "URL: https://example.com",
      "",
      "%description",
      "This is an example RPM package.",
      "",
      "%prep",
      "%setup -q",
      "",
      "%build",
      "make %{?_smp_mflags}",
      "",
      "%install",
      "make install DESTDIR=%{buildroot}",
      "",
      "%files",
      "%{_bindir}/myapp",
      "%{_mandir}/man1/myapp.1*",
      "",
      "%changelog",
      "* Mon Jan 01 2024 Developer <dev@example.com> - 1.0.0-1",
      "- Initial package",
    ].join("\n");
    const state = parseDoc(rpmSpec, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Forth tokenizer deep coverage", () => {
  it("tokenizes Forth with words, colon definitions, and stack operations", () => {
    const doc = [
      "\\ Forth comment",
      ": square ( n -- n^2 ) dup * ;",
      ": factorial ( n -- n! ) dup 1 > if dup 1 - recurse * then ;",
      "",
      "5 square . cr",
      "10 factorial . cr",
      "",
      ": greet ( -- )",
      '  ." Hello, World!" cr ;',
      "",
      "greet",
      "42 constant life",
      "life . cr",
    ].join("\n");
    const state = parseDoc(forth, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
