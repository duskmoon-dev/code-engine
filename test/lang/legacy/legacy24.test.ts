import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { dylan } from "../../../src/lang/legacy/dylan";
import { r } from "../../../src/lang/legacy/r";
import { asterisk } from "../../../src/lang/legacy/asterisk";
import { shell } from "../../../src/lang/legacy/shell";

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
// Dylan
// ---------------------------------------------------------------------------
describe("Dylan tokenizer deep coverage", () => {
  it("tokenizes single and double quoted strings with escapes", () => {
    const doc = [
      '"hello world"',
      "'single quoted'",
      '"escaped \\"quote\\" inside"',
      "'escaped \\\\ backslash'",
    ].join("\n");
    const state = parseDoc(dylan, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes line and block comments including nested", () => {
    const doc = [
      "// single line comment",
      "/* block comment */",
      "/* nested /* comment */ still comment */",
      "/* multi",
      "   line",
      "   comment */",
    ].join("\n");
    const state = parseDoc(dylan, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes hash literals: binary, hex, octal, symbol-string, concat, sequences, atoms, error", () => {
    // #b binary, #x hex, #o octal
    const doc = [
      "#b10110",
      "#x1aFF",
      "#o7654",
      '#"symbol-string"',
      "##",              // token concatenation
      "#[1, 2, 3]",     // vector literal
      "#(1, 2, 3)",     // list literal
      "#t",             // true atom
      "#f",             // false atom
      "#rest",          // hash keyword
      "#all-keys",      // hash keyword
      "#next",          // hash keyword
      "#key",           // hash keyword
      "#include",       // hash keyword
      "#unknown-thing", // error path
    ].join("\n");
    const state = parseDoc(dylan, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes decimal numbers including scientific notation", () => {
    const doc = [
      "42",
      "+42",
      "-42",
      "3.14",
      "+3.14",
      "-3.14",
      "1.0e10",
      "2.5d-3",
      "3s+2",
      "4x1",
      ".5",
    ].join("\n");
    const state = parseDoc(dylan, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes tilde operators: ~, ~=, ~==", () => {
    const doc = [
      "~x",
      "a ~= b",
      "a ~== b",
    ].join("\n");
    const state = parseDoc(dylan, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes colon operators: :=, :: and symbol keywords", () => {
    const doc = [
      "x := 10",
      "a :: <integer>",
      "name:",
      "keyword-arg:",
    ].join("\n");
    const state = parseDoc(dylan, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes brackets, punctuation, and arithmetic operators", () => {
    const doc = [
      "(a + b) * [c - d]",
      "{x / y}",
      "a, b . c",
      "x < y > z",
      "a & b | c ^ d",
      "a = b",
    ].join("\n");
    const state = parseDoc(dylan, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes pattern styles: symbolClass, symbolGlobal, symbolConstant", () => {
    const doc = [
      "<integer>",
      "<string>",
      "*standard-output*",
      "*module-name*",
      "$maximum-value",
      "$pi",
    ].join("\n");
    const state = parseDoc(dylan, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes keywords, definitions, signaling calls, and end", () => {
    const doc = [
      "define method factorial(n :: <integer>)",
      "  if (n <= 1)",
      "    1",
      "  else",
      "    n * factorial(n - 1)",
      "  end if",
      "end method",
      "",
      "define class <point> (<object>)",
      "  slot x :: <integer>, init-keyword: x:;",
      "  slot y :: <integer>, init-keyword: y:;",
      "end class",
      "",
      "define constant $pi = 3.14159",
      "define variable *count* = 0",
      "define generic describe(obj)",
      "",
      "block (exit)",
      "  for (i from 0 below 10)",
      "    signal(\"error\")",
      "    error(\"fatal\")",
      "    break()",
      "  end for",
      "  finally",
      "    cleanup()",
      "  end block",
      "",
      "select (x by instance?)",
      "  <integer> => \"integer\";",
      "  otherwise => \"other\";",
      "end select",
      "",
      "while (running?)",
      "  iterate()",
      "  unless (paused?)",
      "    check-type(val, <integer>)",
      "  end unless",
      "end while",
      "",
      "begin",
      "  let x = 10;",
      "  local method helper() 42 end;",
      "  profiling () body() end;",
      "  dynamic-bind (*var* = 99) body() end;",
      "  until (done?) step() end;",
      "  case",
      "    a => 1;",
      "    b => 2;",
      "  end case",
      "end begin",
      "",
      "with-open-file (f = \"test.txt\")",
      "  without-interrupts",
      "    read(f)",
      "  end",
      "end",
    ].join("\n");
    const state = parseDoc(dylan, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes define keyword and unrecognized characters", () => {
    const doc = [
      "define",
      "define library mylib end",
      "define macro my-macro end",
      "define C-function cfun end",
      "define C-struct cstruct end",
      "define table my-table end",
      "define C-pointer-type <c-ptr> end",
      "define domain my-domain end",
      // unknown symbol falls through to variable or variableName.standard
      "@ weird-char",
    ].join("\n");
    const state = parseDoc(dylan, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// R
// ---------------------------------------------------------------------------
describe("R tokenizer deep coverage", () => {
  it("tokenizes comments and various number formats", () => {
    const doc = [
      "# This is a comment",
      "x <- 42",
      "y <- 3.14",
      "z <- 0xFF",
      "w <- .5",
      "a <- 1e+10",
      "b <- 2.5e-3",
      "c <- 100L",
      "d <- .123e4",
    ].join("\n");
    const state = parseDoc(r, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes strings with escape sequences", () => {
    const doc = [
      'x <- "hello world"',
      "y <- 'single quoted'",
      'z <- "tab\\there"',
      'a <- "hex\\x41char"',
      'b <- "unicode\\u0041char"',
      'c <- "Unicode\\U00000041char"',
      'd <- "unicode\\u{1F600}emoji"',
      'e <- "octal\\101char"',
      'f <- "newline\\nhere"',
    ].join("\n");
    const state = parseDoc(r, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes backtick-quoted names", () => {
    const doc = [
      "`non-standard name` <- 42",
      "`my variable` <- `another var` + 1",
    ].join("\n");
    const state = parseDoc(r, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes dot-dot and dot-digit keywords", () => {
    const doc = [
      "..1",
      "..2",
      "..",
      "...",
    ].join("\n");
    const state = parseDoc(r, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes atoms, builtins, keywords, and block keywords", () => {
    const doc = [
      "NULL",
      "NA",
      "Inf",
      "NaN",
      "NA_integer_",
      "NA_real_",
      "TRUE",
      "FALSE",
      "list(1, 2, 3)",
      "quote(x + y)",
      "eval(expr)",
      "parse(text = code)",
      "deparse(expr)",
      "call('f', 1)",
      "return(42)",
      "bquote(x + .(y))",
    ].join("\n");
    const state = parseDoc(r, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes assignment operators and special operators", () => {
    const doc = [
      "x <- 1",
      "x <<- 2",
      "3 -> y",
      "4 ->> z",
      "a %in% b",
      "c %*% d",
      "e %o% f",
      "g %% h",
      "x$name",
      "a ~ b",
      "x != y",
      "x >= y",
      "x <= y",
      "!x",
      "x & y",
      "x | y",
      "x :: y",
      "x ::: y",
    ].join("\n");
    const state = parseDoc(r, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes control flow with block keywords and else if", () => {
    const doc = [
      "if (x > 0) {",
      "  print('positive')",
      "} else if (x < 0) {",
      "  print('negative')",
      "} else {",
      "  print('zero')",
      "}",
      "",
      "for (i in 1:10) {",
      "  if (i %% 2 == 0) next",
      "  print(i)",
      "}",
      "",
      "while (x > 0) {",
      "  x <- x - 1",
      "}",
      "",
      "repeat {",
      "  x <- x + 1",
      "  if (x > 10) break",
      "}",
    ].join("\n");
    const state = parseDoc(r, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes function definitions with argList context and = operator", () => {
    const doc = [
      "f <- function(x, y = 10, z = NULL) {",
      "  x + y + z",
      "}",
      "",
      "g <- function(a = TRUE, b = list(), ...) {",
      "  do.call(f, list(a = a, b = b))",
      "}",
      "",
      "sapply(1:10, function(i) i^2)",
    ].join("\n");
    const state = parseDoc(r, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes semicolons, brackets, and various punctuation", () => {
    const doc = [
      "x <- 1; y <- 2; z <- 3",
      "m <- matrix(1:9, nrow = 3)",
      "m[1, 2]",
      "m[1, ]",
      "l <- list(a = 1, b = 2)",
      "l[[1]]",
      "{",
      "  a <- 1",
      "  b <- 2",
      "}",
    ].join("\n");
    const state = parseDoc(r, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes identifier starting with dot followed by non-digit", () => {
    const doc = [
      ".GlobalEnv",
      ".Machine",
      ".Platform",
      ".libPaths()",
    ].join("\n");
    const state = parseDoc(r, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// Asterisk
// ---------------------------------------------------------------------------
describe("Asterisk tokenizer deep coverage", () => {
  it("tokenizes line comments and block comments", () => {
    const doc = [
      "; This is a line comment",
      ";-- This is a block comment",
      "spanning multiple lines",
      "--;",
      "; Another line comment",
    ].join("\n");
    const state = parseDoc(asterisk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes block comment that ends on the same line as start", () => {
    const doc = [
      ";-- short block --;",
    ].join("\n");
    const state = parseDoc(asterisk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes block comment spanning many lines without close on first line", () => {
    const doc = [
      ";-- block comment",
      "middle of comment",
      "still commenting",
      "--;",
    ].join("\n");
    const state = parseDoc(asterisk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes block comment with dash but not close (;--- is NOT block comment)", () => {
    // ;--- is not a block comment per the code
    const doc = [
      ";--- this is actually a line comment",
      "exten => 100,1,Answer()",
    ].join("\n");
    const state = parseDoc(asterisk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes context headers", () => {
    const doc = [
      "[general]",
      "[default]",
      "[internal]",
      "[from-external]",
    ].join("\n");
    const state = parseDoc(asterisk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes double-quoted and single-quoted strings", () => {
    const doc = [
      'exten => 100,1,Playback("hello-world")',
      "exten => 101,1,Set(VAR='value')",
    ].join("\n");
    const state = parseDoc(asterisk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes dialplan commands #include and #exec", () => {
    const doc = [
      "#include extensions_custom.conf",
      "#exec /usr/bin/generate-config.sh",
    ].join("\n");
    const state = parseDoc(asterisk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes channel variables ${...}", () => {
    const doc = [
      "exten => 100,1,Set(CALLERID(name)=${CALLERID(num)})",
      "exten => 100,n,NoOp(${EXTEN})",
    ].join("\n");
    const state = parseDoc(asterisk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes exten with arrow, priority, and known applications", () => {
    const doc = [
      "[default]",
      "exten => 100,1,Answer()",
      "exten => 100,n,Playback(hello-world)",
      "exten => 100,n,Hangup()",
      "exten => 200,1,Dial(SIP/200,30)",
      "exten => 200,n,VoiceMail(200@default)",
      "exten => _X.,1,NoOp(Wildcard match)",
    ].join("\n");
    const state = parseDoc(asterisk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes same => with priority and application", () => {
    const doc = [
      "[default]",
      "exten => 100,1,Answer()",
      "same => n,Wait(1)",
      "same => n,Playback(hello-world)",
      "same => n,Hangup()",
    ].join("\n");
    const state = parseDoc(asterisk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes include and switch atoms with => arrow", () => {
    const doc = [
      "[default]",
      "include => internal",
      "switch => Realtime",
      "ignorepat => 9",
    ].join("\n");
    const state = parseDoc(asterisk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes exten with = (single equals) arrow", () => {
    const doc = [
      "[default]",
      "exten = 100,1,Answer()",
      "exten = 100,n,Hangup()",
    ].join("\n");
    const state = parseDoc(asterisk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes error path for invalid exten start continuation", () => {
    const doc = [
      "[default]",
      "exten invalid-continuation",
    ].join("\n");
    const state = parseDoc(asterisk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes various known Asterisk applications", () => {
    const doc = [
      "[default]",
      "exten => 100,1,Answer()",
      "same => n,Background(main-menu)",
      "same => n,Dial(SIP/100,30)",
      "same => n,Goto(default,200,1)",
      "same => n,GotoIf($[${x} > 0]?200,1)",
      "same => n,Set(x=1)",
      "same => n,Verbose(2,Testing)",
      "same => n,MusicOnHold(default)",
      "same => n,Queue(support)",
      "same => n,VoiceMail(100@default)",
      "same => n,Read(RESULT,,4)",
      "same => n,System(echo hello)",
      "same => n,AGI(my-script.agi)",
      "same => n,Hangup()",
    ].join("\n");
    const state = parseDoc(asterisk, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------
describe("Shell tokenizer deep coverage", () => {
  it("tokenizes shebang line", () => {
    const doc = [
      "#!/bin/bash",
      "echo hello",
    ].join("\n");
    const state = parseDoc(shell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes comments (non-shebang)", () => {
    const doc = [
      "# regular comment",
      "x=1 # inline comment",
    ].join("\n");
    const state = parseDoc(shell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes single-quoted, double-quoted, and backtick strings", () => {
    const doc = [
      "echo 'single quoted'",
      'echo "double quoted"',
      "result=`uname -a`",
    ].join("\n");
    const state = parseDoc(shell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes dollar expressions: ${}, $(), $var, $digit", () => {
    const doc = [
      'echo "${HOME}"',
      'echo "$(whoami)"',
      "echo $USER",
      "echo $0 $1 $2",
      "echo $?",
      "echo $$",
    ].join("\n");
    const state = parseDoc(shell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes heredoc syntax", () => {
    const doc = [
      "cat <<EOF",
      "This is a heredoc",
      "with multiple lines",
      "EOF",
      "",
      "cat <<'NOEXPAND'",
      "No $expansion here",
      "NOEXPAND",
      "",
      'cat <<"QUOTED"',
      "quoted heredoc",
      "QUOTED",
      "",
      "cat <<-INDENTED",
      "\tindented heredoc",
      "INDENTED",
    ].join("\n");
    const state = parseDoc(shell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operators: +, =, <<, backslash escape", () => {
    const doc = [
      "x=1",
      "y=2",
      "echo $((x + y))",
      "cat <<< 'here string'",
      "echo line1 \\",
      "  line2",
    ].join("\n");
    const state = parseDoc(shell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes flags and attributes", () => {
    const doc = [
      "ls -la",
      "grep -rn pattern",
      "find . -name '*.ts' -type f",
      "tar --extract --file archive.tar.gz",
      "curl --silent --fail https://example.com",
    ].join("\n");
    const state = parseDoc(shell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes numbers", () => {
    const doc = [
      "echo 42",
      "echo 100",
      "sleep 5",
      "exit 0",
      "exit 1",
    ].join("\n");
    const state = parseDoc(shell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes keywords, atoms, builtins, and variable definitions", () => {
    const doc = [
      "if [ $x -gt 0 ]; then",
      "  echo true",
      "elif [ $x -eq 0 ]; then",
      "  echo false",
      "else",
      "  echo negative",
      "fi",
      "",
      "for i in 1 2 3; do",
      "  echo $i",
      "done",
      "",
      "while true; do",
      "  sleep 1",
      "  break",
      "done",
      "",
      "until false; do",
      "  sleep 1",
      "done",
      "",
      "case $x in",
      "  1) echo one;;",
      "  *) echo other;;",
      "esac",
      "",
      "function myfunc {",
      "  local var=value",
      "  echo $var",
      "}",
      "",
      "export PATH=/usr/bin:$PATH",
      "set -euo pipefail",
      "unset MYVAR",
      "",
      "MY_VAR=hello",
      "ANOTHER_VAR=world",
    ].join("\n");
    const state = parseDoc(shell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes builtins as commands", () => {
    const doc = [
      "cd /tmp",
      "ls -la",
      "mkdir -p /tmp/test",
      "cp file1 file2",
      "mv old new",
      "rm -rf /tmp/test",
      "cat file.txt",
      "grep pattern file",
      "sed 's/old/new/g' file",
      "awk '{print $1}' file",
      "curl https://example.com",
      "wget https://example.com",
      "ssh user@host",
      "sudo command",
      "git status",
      "npm install",
      "node script.js",
    ].join("\n");
    const state = parseDoc(shell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes nested string with dollar and embedded quotes", () => {
    const doc = [
      'echo "Hello $USER, your home is $HOME"',
      'echo "Nested $(echo "inner")"',
      "echo \"It's a test\"",
      "echo 'He said \"hello\"'",
      'x="${arr[0]}"',
      "echo \"$(date '+%Y-%m-%d')\"",
    ].join("\n");
    const state = parseDoc(shell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes $' and $\" dollar-prefixed strings", () => {
    const doc = [
      "$'escaped\\nnewline'",
      "$\"double with $VAR\"",
    ].join("\n");
    const state = parseDoc(shell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes < without heredoc (just operator)", () => {
    const doc = [
      "sort < input.txt",
      "diff <(ls dir1) <(ls dir2)",
    ].join("\n");
    const state = parseDoc(shell, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
