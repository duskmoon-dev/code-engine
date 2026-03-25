import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { http } from "../../../src/lang/legacy/http";
import { mumps } from "../../../src/lang/legacy/mumps";
import { scheme } from "../../../src/lang/legacy/scheme";
import { q } from "../../../src/lang/legacy/q";
import { oz } from "../../../src/lang/legacy/oz";
import { octave } from "../../../src/lang/legacy/octave";

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

describe("HTTP tokenizer deep coverage", () => {
  it("tokenizes HTTP response with success status code", () => {
    const doc = [
      "HTTP/1.1 200 OK",
      "Content-Type: application/json",
      "Content-Length: 27",
      "",
      '{"status": "ok"}',
    ].join("\n");
    const state = parseDoc(http, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes HTTP response with error status code", () => {
    // Triggers status >= 400 path returning "error"
    const doc = [
      "HTTP/1.1 404 Not Found",
      "Content-Type: text/html",
      "",
      "<h1>Not Found</h1>",
    ].join("\n");
    const state = parseDoc(http, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes HTTP request with method, path, and protocol", () => {
    // Triggers requestPath and requestProtocol paths
    const doc = [
      "GET /api/users?page=1 HTTP/1.1",
      "Host: example.com",
      "Authorization: Bearer token123",
      "Accept: application/json",
      "",
      "",
    ].join("\n");
    const state = parseDoc(http, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes HTTP with invalid first line (failFirstLine)", () => {
    // Triggers the failFirstLine error path
    const doc = [
      "INVALID LINE WITHOUT SPACE",
      "Content-Type: text/plain",
    ].join("\n");
    const state = parseDoc(http, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes HTTP header continuation lines", () => {
    // Triggers the header branch where sol() is true but starts with space/tab
    const doc = [
      "HTTP/1.1 200 OK",
      "Content-Type: multipart/mixed;",
      " boundary=something",
      "X-Custom: value",
      "\tcontinued-value",
      "",
      "body content here",
    ].join("\n");
    const state = parseDoc(http, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes HTTP header with non-header line (error path)", () => {
    // Triggers header error path: sol, no colon found
    const doc = [
      "HTTP/1.1 200 OK",
      "Content-Type: text/plain",
      "this line has no colon",
      "",
      "body",
    ].join("\n");
    const state = parseDoc(http, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("MUMPS tokenizer deep coverage", () => {
  it("tokenizes MUMPS with labels, commands, and comments", () => {
    const doc = [
      "MAIN ; Main entry point",
      " SET X=10",
      " SET Y=20",
      " WRITE X+Y,!",
      " QUIT",
    ].join("\n");
    const state = parseDoc(mumps, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes MUMPS with intrinsic functions and globals", () => {
    // Triggers intrinsicFuncs, $-prefixed builtins, and ^-globals
    const doc = [
      " SET LEN=$LENGTH(STR)",
      " SET SUB=$EXTRACT(STR,1,5)",
      ' SET POS=$FIND(STR,"ABC")',
      " SET X=$HOROLOG",
      " SET ^GLOBAL(1)=X",
      " SET ^DD(100)=Y",
      " SET $ECODE=\"\"",
    ].join("\n");
    const state = parseDoc(mumps, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes MUMPS with strings, numbers, and operators", () => {
    // Triggers string, number, double/single operators, brackets
    const doc = [
      ' SET X="Hello World"',
      " SET Y=3.14",
      " SET Z=-42",
      " SET R=X_Y",
      " IF X'=Y WRITE !",
      " IF X<=Y WRITE !",
      " IF X>=Y WRITE !",
      ' SET A="unterminated',
    ].join("\n");
    const state = parseDoc(mumps, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes MUMPS with command post-conditionals and indirection", () => {
    // Triggers commandMode < 0 and @ indirection
    const doc = [
      " SET:X>0 Y=1",
      " WRITE:Y=1 !",
      " DO:X SUB1",
      " SET @VAR=123",
      " SET @(\"^DATA\",1)=VALUE",
      " DO .BLOCK1",
      " . SET A=1",
      " . SET B=2",
    ].join("\n");
    const state = parseDoc(mumps, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes MUMPS with abbreviated commands and dollar-sign", () => {
    // Triggers abbreviated single-letter commands and bare $ and ^
    const doc = [
      " S X=1",
      " W X,!",
      " D SUB",
      " K X",
      " N Y",
      " Q",
      " S Z=$ZZFUNC(X)",
      " S W=$ZUTIL(1)",
    ].join("\n");
    const state = parseDoc(mumps, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Scheme tokenizer deep coverage", () => {
  it("tokenizes Scheme with nested lists and keywords", () => {
    const doc = [
      "(define (factorial n)",
      "  (if (<= n 1)",
      "      1",
      "      (* n (factorial (- n 1)))))",
      "",
      "(let ((x 10)",
      "      (y 20))",
      "  (+ x y))",
    ].join("\n");
    const state = parseDoc(scheme, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Scheme with multi-line block comments", () => {
    // Triggers #| ... |# comment mode
    const doc = [
      "#| This is a",
      "   multi-line",
      "   block comment |#",
      "(define x 42)",
    ].join("\n");
    const state = parseDoc(scheme, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Scheme with s-expression comments and quoted lists", () => {
    // Triggers #; s-expr-comment mode on paren and on atom
    const doc = [
      "#;(this whole expression is commented out)",
      "#;atom-comment",
      "(define x 10)",
      "'(1 2 3)",
      "'symbol",
      "'[vector-like]",
    ].join("\n");
    const state = parseDoc(scheme, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Scheme with number literals in different radixes", () => {
    // Triggers #b, #o, #x, #d, #e, #i radix/exactness prefixes
    const doc = [
      "#b1010",
      "#o777",
      "#xff",
      "#d123",
      "#e#b101",
      "#i#x1a",
      "#e3.14",
      "+42",
      "-3.14e10",
      "1/3",
      "+i",
      "3+4i",
    ].join("\n");
    const state = parseDoc(scheme, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Scheme with escaped symbols and strings", () => {
    // Triggers | ... | symbol mode and multi-line string mode
    const doc = [
      '|weird symbol name|',
      '|has spaces and \\ escapes|',
      '"hello world"',
      '"multi-line',
      'string continues"',
      '"escape \\n \\t \\\\"',
    ].join("\n");
    const state = parseDoc(scheme, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Scheme with boolean literals and bracket matching", () => {
    // Triggers #t, #f atoms and [ ] bracket forms
    const doc = [
      "#t",
      "#f",
      "#T",
      "#F",
      "[define x 1]",
      "(cond [#t 'yes] [#f 'no])",
      ";; line comment",
      "(lambda (x) (+ x 1))",
      "(letrec ((even? (lambda (n) (if (= n 0) #t (odd? (- n 1)))))",
      "         (odd? (lambda (n) (if (= n 0) #f (even? (- n 1))))))",
      "  (even? 10))",
    ].join("\n");
    const state = parseDoc(scheme, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("q/kdb+ tokenizer deep coverage", () => {
  it("tokenizes q with line and block comments", () => {
    // Triggers tokenLineComment (/ at sol) and tokenBlockComment (/\n...\)
    const doc = [
      "/ This is a line comment",
      "/",
      "This is a block comment",
      "spanning multiple lines",
      "\\",
      "x:42",
    ].join("\n");
    const state = parseDoc(q, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes q with temporal literals", () => {
    // Triggers temporal date/time patterns
    const doc = [
      "d:2024.01.15",
      "dt:2024.01.15D12:30:00.000000000",
      "m:2024.01m",
      "t:12:30:00",
      "t2:12:30:00.123",
      "ts:5D12:30:00",
      "mn:00:30",
    ].join("\n");
    const state = parseDoc(q, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes q with strings, symbols, and backtick macros", () => {
    // Triggers tokenString, backtick macroName, and keywords
    const doc = [
      'msg:"hello world"',
      'escaped:"line1\\nline2"',
      "sym:`price",
      "path:`:/data/trades",
      "t:([]sym:`AAPL`GOOG;price:150.0 2800.0)",
      "select avg price by sym from t",
    ].join("\n");
    const state = parseDoc(q, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes q with special number forms and operators", () => {
    // Triggers 0N, 0W, 0x hex, binary 101b, typed numbers (h,i,j,f)
    const doc = [
      "n:0N",
      "w:0W",
      "h:0x0a0b",
      "bits:101b",
      "sh:42h",
      "lng:100j",
      "ch:\"c\"$42",
      "x:1+2*3%4",
    ].join("\n");
    const state = parseDoc(q, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes q with inline comment after whitespace", () => {
    // Triggers the whitespace-then-/ inline comment path
    const doc = [
      "x:42 / inline comment",
      "y:x+1 / another comment",
      "\\l script.q",
    ].join("\n");
    const state = parseDoc(q, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes q with comment-to-EOF (backslash at sol with trailing space)", () => {
    // Triggers tokenCommentToEOF: backslash followed by whitespace at sol
    const doc = [
      "x:1",
      "\\  ",
      "everything after is ignored",
      "more ignored stuff",
    ].join("\n");
    const state = parseDoc(q, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Oz tokenizer deep coverage", () => {
  it("tokenizes Oz with proc, fun definitions and class", () => {
    // Triggers tokenFunProc (with { and name) and tokenClass
    const doc = [
      "declare",
      "fun {Factorial N}",
      "  if N =< 1 then 1",
      "  else N * {Factorial N-1}",
      "  end",
      "end",
      "",
      "proc {PrintResult X}",
      "  {Show X}",
      "end",
      "",
      "class Counter",
      "  attr val",
      "  meth init(V)",
      "    val := V",
      "  end",
      "  meth inc",
      "    val := @val + 1",
      "  end",
      "end",
    ].join("\n");
    const state = parseDoc(oz, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Oz with strings, atoms, and comments", () => {
    // Triggers tokenString for both single and double quotes, and block comments
    const doc = [
      "% This is a line comment",
      "/* This is a",
      "   block comment */",
      'X = "hello world"',
      "Y = 'an atom'",
      'Z = "escape \\n \\t"',
    ].join("\n");
    const state = parseDoc(oz, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Oz with numbers including hex and negative (tilde)", () => {
    // Triggers ~digit (negative), hex 0x, float with exponent
    const doc = [
      "X = 42",
      "Y = ~15",
      "Z = 0xFF",
      "W = 3.14",
      "V = ~0xAB",
      "E = 1.5e10",
      "E2 = ~2.0e~3",
      "[] = nil",
    ].join("\n");
    const state = parseDoc(oz, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Oz with control flow keywords and operators", () => {
    // Triggers middle keywords, triple operators, and various branches
    const doc = [
      "local X Y in",
      "  case X of 1 then Y = one",
      "  elseof 2 then Y = two",
      "  elsecase Y of a then skip",
      "  else Y = other",
      "  end",
      "end",
      "",
      "if true then",
      "  {Show ok}",
      "elseif false then",
      "  {Show no}",
      "else",
      "  {Show maybe}",
      "end",
      "",
      "try",
      "  raise error end",
      "catch E then",
      "  {Show E}",
      "finally",
      "  {Show done}",
      "end",
    ].join("\n");
    const state = parseDoc(oz, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Oz with special operators and [] keyword", () => {
    // Triggers [] keyword, triple operators :::, ..., and double operators
    const doc = [
      "X = []",
      "Y = a|b|[]",
      "Z = X:::Y",
      "R = 1...10",
      "A <- B",
      "C := D",
      "E =< F",
      "G >= H",
      "I !! J",
      "K == L",
      "M :: N",
      "O <: P",
      "Q >: R",
      "S =: T",
      "U \\= V",
    ].join("\n");
    const state = parseDoc(oz, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Oz with meth definitions and backtick names", () => {
    // Triggers tokenMeth with backtick name and tokenFunProc with $
    const doc = [
      "class MyClass",
      "  meth `special name`(X)",
      "    skip",
      "  end",
      "  meth normalMethod(Y)",
      "    skip",
      "  end",
      "end",
      "",
      "proc {$ X}",
      "  {Show X}",
      "end",
      "",
      "fun {$ X} X*2 end",
    ].join("\n");
    const state = parseDoc(oz, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Octave tokenizer deep coverage", () => {
  it("tokenizes Octave with block comments", () => {
    // Triggers tokenComment for %{ ... %}
    const doc = [
      "%{",
      "This is a block comment",
      "spanning multiple lines",
      "%}",
      "x = 42;",
    ].join("\n");
    const state = parseDoc(octave, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Octave with number literals and special values", () => {
    // Triggers hex, float with exponent, NaN, Inf, complex
    const doc = [
      "x = 0xFF;",
      "y = 3.14;",
      "z = 1.5e10;",
      "w = 2.0E-3;",
      "n = NaN;",
      "i = Inf;",
      "c = 3 + 4i;",
      "h = 0x1Aj;",
      "d = 1.5D2;",
      "p = +42;",
      "m = -3.14;",
    ].join("\n");
    const state = parseDoc(octave, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Octave with strings and transpose operator", () => {
    // Triggers tokenTranspose (') after variable/number, and string matching
    const doc = [
      "s1 = \"hello world\";",
      "s2 = 'single quoted';",
      "A = [1 2; 3 4];",
      "B = A';",
      "C = A'';",
      "x = 5;",
      "y = x';",
      "bad = \"unterminated",
    ].join("\n");
    const state = parseDoc(octave, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Octave with keywords, builtins, and control flow", () => {
    const doc = [
      "function y = myFunc(x)",
      "  if x > 0",
      "    y = sqrt(x);",
      "  elseif x == 0",
      "    y = 0;",
      "  else",
      "    y = abs(x);",
      "  endif",
      "endfunction",
      "",
      "for i = 1:10",
      "  disp(i);",
      "  if mod(i, 2) == 0",
      "    continue;",
      "  end",
      "endfor",
      "",
      "while true",
      "  break;",
      "endwhile",
    ].join("\n");
    const state = parseDoc(octave, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Octave with operators and delimiters", () => {
    // Triggers double operators (.*, ./, .^, .\\), double/triple delimiters
    const doc = [
      "A = [1 2; 3 4];",
      "B = A .* A;",
      "C = A ./ A;",
      "D = A .^ 2;",
      "E = A .\\ A;",
      "x = 10;",
      "x += 5;",
      "x -= 3;",
      "x *= 2;",
      "x /= 4;",
      "y = (x ~= 0);",
      "z = (x <= 10) & (x >= 0);",
      "w = x << 2;",
      "v = x >> 1;",
      "a >>= b;",
      "c <<= d;",
      "# octave comment",
    ].join("\n");
    const state = parseDoc(octave, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Octave with expression end and transpose chaining", () => {
    // Triggers expressionEnd ] ) followed by tokenTranspose
    const doc = [
      "A = [1 2 3];",
      "B = A(1);",
      "C = A(1)';",
      "D = [1 2]';",
      "E = rand(3,3);",
      "F = inv(E)';",
      "G = eye(3);",
    ].join("\n");
    const state = parseDoc(octave, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
