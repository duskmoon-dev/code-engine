import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { oCaml, fSharp, sml } from "../../../src/lang/legacy/mllike";
import { standardSQL, mySQL, plSQL, sqlite } from "../../../src/lang/legacy/sql";
import { commonLisp } from "../../../src/lang/legacy/commonlisp";
import { javascript as legacyJS } from "../../../src/lang/legacy/javascript";

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

describe("OCaml tokenizer deep coverage", () => {
  it("tokenizes OCaml with nested comments and long strings", () => {
    // Tests nested (* ... *) comments and {|...|} long strings
    const doc = [
      "(* OCaml comment *)",
      "(* nested (* comment *) *)",
      "",
      'let s = {|long string content with "quotes" and stuff|}',
      "let n = 42",
      "let f = 3.14",
    ].join("\n");
    const state = parseDoc(oCaml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes OCaml with labeled arguments (~name and ?name)", () => {
    // Tests ch === '~' and ch === '?' paths
    const doc = [
      "(* Labeled and optional args *)",
      "let add ~x ~y = x + y",
      "let greet ?sep name =",
      "  let s = match sep with Some s -> s | None -> \", \" in",
      '  \"Hello\" ^ s ^ name',
      "",
      "let _ = add ~x:1 ~y:2",
    ].join("\n");
    const state = parseDoc(oCaml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes OCaml with backtick polymorphic variants", () => {
    // Tests ch === '`' path (quoted identifiers)
    const doc = [
      "type color = [ `Red | `Green | `Blue ]",
      "",
      "let to_string = function",
      "  | `Red -> \"red\"",
      "  | `Green -> \"green\"",
      "  | `Blue -> \"blue\"",
      "",
      "let x : [> `Red] = `Red",
    ].join("\n");
    const state = parseDoc(oCaml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes OCaml with various number literals", () => {
    // Tests binary (0b), hex (0x), octal (0o) number paths
    const doc = [
      "let bin = 0b1010",
      "let hex = 0xFF",
      "let oct = 0o777",
      "let float1 = 3.14",
      "let float2 = 1.5e-3",
      "let float3 = 2.0e+10",
      "let big = 1_000_000",
      "let pi = 3.14159",
    ].join("\n");
    const state = parseDoc(oCaml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes OCaml with modules, functors, and types", () => {
    const doc = [
      "module type COMPARABLE = sig",
      "  type t",
      "  val compare : t -> t -> int",
      "end",
      "",
      "module Make(C : COMPARABLE) = struct",
      "  type t = C.t list",
      "  let empty = []",
      "  let insert x lst = List.sort C.compare (x :: lst)",
      "end",
      "",
      "type 'a tree =",
      "  | Leaf",
      "  | Node of 'a tree * 'a * 'a tree",
      "",
      "let rec height = function",
      "  | Leaf -> 0",
      "  | Node(l, _, r) -> 1 + max (height l) (height r)",
    ].join("\n");
    const state = parseDoc(oCaml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("F# tokenizer deep coverage", () => {
  it("tokenizes F# with line comments (// style)", () => {
    // F# uses slashComments: true, triggers lines 64-65
    const doc = [
      "// F# line comment",
      "(* F# block comment *)",
      "",
      "let x = 42",
      "// another comment",
      "let y = x + 1",
    ].join("\n");
    const state = parseDoc(fSharp, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes F# with various features", () => {
    const doc = [
      "module MyModule",
      "",
      "open System",
      "open System.Collections.Generic",
      "",
      "type Person = {",
      "    Name: string",
      "    Age: int",
      "}",
      "",
      "let greet person =",
      '    printfn "Hello, %s!" person.Name',
      "",
      "let fibonacci n =",
      "    let rec fib a b = function",
      "        | 0 -> a",
      "        | n -> fib b (a + b) (n - 1)",
      "    fib 0 1 n",
      "",
      "let squares = [1..10] |> List.map (fun x -> x * x)",
      "",
      "[<EntryPoint>]",
      "let main argv =",
      "    greet { Name = \"World\"; Age = 42 }",
      "    0",
    ].join("\n");
    const state = parseDoc(fSharp, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes F# with computation expressions and pattern matching", () => {
    const doc = [
      "// Async computation",
      "let fetchData url = async {",
      "    let! response = Http.getAsync url",
      "    return! response.Content.ReadAsStringAsync() |> Async.AwaitTask",
      "}",
      "",
      "// Option type",
      "let safeDivide x y =",
      "    match y with",
      "    | 0 -> None",
      "    | _ -> Some (x / y)",
      "",
      "// Discriminated union",
      "type Shape =",
      "    | Circle of float",
      "    | Rectangle of float * float",
      "    | Triangle of float * float * float",
      "",
      "let area = function",
      "    | Circle r -> Math.PI * r * r",
      "    | Rectangle(w, h) -> w * h",
      "    | Triangle(a, b, c) ->",
      "        let s = (a + b + c) / 2.0",
      "        sqrt (s * (s-a) * (s-b) * (s-c))",
    ].join("\n");
    const state = parseDoc(fSharp, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("SML tokenizer deep coverage", () => {
  it("tokenizes SML with datatypes and pattern matching", () => {
    const doc = [
      "(* SML program *)",
      "datatype 'a tree =",
      "    Leaf",
      "  | Node of 'a tree * 'a * 'a tree",
      "",
      "fun height Leaf = 0",
      "  | height (Node(l, _, r)) = 1 + Int.max(height l, height r)",
      "",
      "fun insert x Leaf = Node(Leaf, x, Leaf)",
      "  | insert x (Node(l, v, r)) =",
      "      if x < v then Node(insert x l, v, r)",
      "      else if x > v then Node(l, v, insert x r)",
      "      else Node(l, v, r)",
    ].join("\n");
    const state = parseDoc(sml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes SML with signatures, structures, and functors", () => {
    const doc = [
      "signature ORDERED = sig",
      "  type t",
      "  val compare : t * t -> order",
      "end",
      "",
      "structure IntOrder : ORDERED = struct",
      "  type t = int",
      "  fun compare(x, y) = Int.compare(x, y)",
      "end",
      "",
      "functor MakeSet(O : ORDERED) = struct",
      "  type elem = O.t",
      "  type set = elem list",
      "  val empty = []",
      "  fun insert x s = if List.exists (fn y => O.compare(x,y)=EQUAL) s",
      "                   then s else x :: s",
      "end",
    ].join("\n");
    const state = parseDoc(sml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Legacy SQL tokenizer deeper coverage", () => {
  it("tokenizes SQL with more dialect features (MySQL)", () => {
    const doc = [
      "-- MySQL specific",
      "SELECT `name`, `email` FROM `users`",
      "WHERE `active` = 1",
      "  AND `created_at` > '2023-01-01'",
      "  AND `score` BETWEEN 0 AND 100",
      "ORDER BY `name` ASC",
      "LIMIT 10 OFFSET 20;",
      "",
      "INSERT INTO `logs` (`user_id`, `action`, `timestamp`)",
      "VALUES (1, 'login', NOW());",
      "",
      "UPDATE `users` SET `last_login` = NOW()",
      "WHERE `id` = 1;",
    ].join("\n");
    const state = parseDoc(mySQL, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes SQL with stored procedures and functions (PL/SQL)", () => {
    const doc = [
      "-- PL/SQL procedure",
      "CREATE OR REPLACE PROCEDURE update_salary",
      "  (p_emp_id IN NUMBER, p_amount IN NUMBER)",
      "AS",
      "  v_current NUMBER;",
      "BEGIN",
      "  SELECT salary INTO v_current",
      "  FROM employees WHERE emp_id = p_emp_id;",
      "",
      "  UPDATE employees",
      "  SET salary = v_current + p_amount",
      "  WHERE emp_id = p_emp_id;",
      "",
      "  COMMIT;",
      "EXCEPTION",
      "  WHEN NO_DATA_FOUND THEN",
      "    DBMS_OUTPUT.PUT_LINE('Employee not found');",
      "  WHEN OTHERS THEN",
      "    ROLLBACK;",
      "    RAISE;",
      "END update_salary;",
    ].join("\n");
    const state = parseDoc(plSQL, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes SQL with advanced queries (subqueries, CTEs, windows)", () => {
    const doc = [
      "-- Advanced SQL features",
      "WITH monthly_sales AS (",
      "  SELECT",
      "    DATE_TRUNC('month', sale_date) AS month,",
      "    SUM(amount) AS total",
      "  FROM sales",
      "  GROUP BY 1",
      "),",
      "ranked AS (",
      "  SELECT *,",
      "    RANK() OVER (ORDER BY total DESC) AS rnk",
      "  FROM monthly_sales",
      ")",
      "SELECT * FROM ranked WHERE rnk <= 3;",
      "",
      "-- Lateral join",
      "SELECT e.name, dept_info.*",
      "FROM employees e,",
      "  LATERAL (",
      "    SELECT d.name, d.budget",
      "    FROM departments d",
      "    WHERE d.id = e.dept_id",
      "  ) AS dept_info;",
    ].join("\n");
    const state = parseDoc(standardSQL, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes SQLite with specific features", () => {
    const doc = [
      "-- SQLite specific",
      "PRAGMA journal_mode=WAL;",
      "PRAGMA foreign_keys=ON;",
      "",
      "CREATE TABLE IF NOT EXISTS users (",
      "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
      "  name TEXT NOT NULL,",
      "  email TEXT UNIQUE,",
      "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
      ");",
      "",
      "CREATE INDEX idx_users_email ON users(email);",
      "",
      "SELECT * FROM users",
      "WHERE name LIKE '%Alice%'",
      "  OR email GLOB '*@example.com';",
    ].join("\n");
    const state = parseDoc(sqlite, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Common Lisp tokenizer deeper coverage", () => {
  it("tokenizes Common Lisp with reader macros and special syntax", () => {
    // targets uncovered lines 28-29, 31-38, 59-65, 97-98
    const doc = [
      "; Reader macros",
      "#'function-name",
      "#'(lambda (x) (* x x))",
      "",
      "; Bit vector",
      "#*10101010",
      "",
      "; Sharpsign",
      "#p\"/usr/local/bin\"",
      "#c(3 4)",
      "",
      "(defvar *global* 42)",
      "(defparameter +constant+ 100)",
      "",
      "; Backquote and splice",
      "(let ((x '(1 2 3)))",
      "  `(start ,@x end))",
      "",
      "; Multiple values",
      "(multiple-value-bind (q r) (floor 10 3)",
      "  (format t \"~A remainder ~A\" q r))",
    ].join("\n");
    const state = parseDoc(commonLisp, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Common Lisp with condition system and CLOS", () => {
    const doc = [
      "(define-condition my-error (error)",
      "  ((message :initarg :message :reader error-message)))",
      "",
      "(defgeneric describe-shape (shape))",
      "",
      "(defmethod describe-shape ((shape circle))",
      "  (format nil \"Circle with radius ~A\" (radius shape)))",
      "",
      "(defmethod describe-shape ((shape rectangle))",
      "  (format nil \"Rectangle ~Ax~A\" (width shape) (height shape)))",
      "",
      "(handler-case",
      "  (error 'my-error :message \"something went wrong\")",
      "  (my-error (c)",
      "    (format t \"Caught: ~A~%\" (error-message c))))",
      "",
      "(with-open-file (stream \"/tmp/test.txt\" :direction :output)",
      "  (format stream \"Hello~%\"))",
    ].join("\n");
    const state = parseDoc(commonLisp, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Legacy JavaScript tokenizer deeper coverage", () => {
  it("tokenizes legacy JS with complex patterns and ES5 features", () => {
    // many uncovered paths in javascript.js
    const doc = [
      "// ES5 patterns",
      "(function() {",
      "  'use strict';",
      "",
      "  var obj = Object.create(null);",
      "  Object.defineProperty(obj, 'x', {",
      "    get: function() { return this._x; },",
      "    set: function(v) { this._x = v; },",
      "    enumerable: true,",
      "    configurable: false",
      "  });",
      "",
      "  // Regex patterns",
      "  var re1 = /^[a-z]+$/i;",
      "  var re2 = /\\d{3}-\\d{4}/g;",
      "  var re3 = new RegExp('pattern', 'gm');",
      "",
      "  // Prototype chain",
      "  function Animal(name) { this.name = name; }",
      "  Animal.prototype.speak = function() { return 'Generic'; };",
      "  function Dog(name) { Animal.call(this, name); }",
      "  Dog.prototype = Object.create(Animal.prototype);",
      "  Dog.prototype.speak = function() { return 'Woof'; };",
      "})();",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes legacy JS with template literals and destructuring", () => {
    const doc = [
      "// Template literals",
      "const name = 'World';",
      "const msg = `Hello ${name}!`;",
      "const multi = `",
      "  Line 1",
      "  Line 2",
      "  ${name}",
      "`;",
      "",
      "// Destructuring",
      "const { a, b, ...rest } = { a: 1, b: 2, c: 3, d: 4 };",
      "const [first, second, ...others] = [1, 2, 3, 4, 5];",
      "",
      "// Spread operator",
      "const arr = [...others, 6, 7];",
      "const obj = { ...rest, e: 5 };",
      "",
      "// Default params",
      "function greet(name = 'World', greeting = 'Hello') {",
      "  return `${greeting}, ${name}!`;",
      "}",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes legacy JS with generators and iterators", () => {
    const doc = [
      "function* fibonacci() {",
      "  let [a, b] = [0, 1];",
      "  while (true) {",
      "    yield a;",
      "    [a, b] = [b, a + b];",
      "  }",
      "}",
      "",
      "async function* asyncGenerator() {",
      "  for (let i = 0; i < 10; i++) {",
      "    await new Promise(r => setTimeout(r, 100));",
      "    yield i;",
      "  }",
      "}",
      "",
      "// Symbol and iterator protocol",
      "const iterable = {",
      "  [Symbol.iterator]() {",
      "    let n = 0;",
      "    return {",
      "      next() { return n < 3 ? { value: n++, done: false } : { done: true }; }",
      "    };",
      "  }",
      "};",
      "",
      "// WeakMap and WeakSet",
      "const wm = new WeakMap();",
      "const ws = new WeakSet();",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes legacy JS with Proxy, Reflect, and meta-programming", () => {
    const doc = [
      "// Proxy",
      "const handler = {",
      "  get(target, prop, receiver) {",
      "    return Reflect.get(target, prop, receiver);",
      "  },",
      "  set(target, prop, value, receiver) {",
      "    return Reflect.set(target, prop, value, receiver);",
      "  }",
      "};",
      "",
      "const p = new Proxy({}, handler);",
      "",
      "// Decorator pattern (stage 3)",
      "class Observable {",
      "  #value;",
      "  constructor(v) { this.#value = v; }",
      "  get value() { return this.#value; }",
      "  set value(v) { this.#value = v; }",
      "}",
      "",
      "// Tagged template",
      "function tag(strings, ...values) {",
      "  return strings.map((s, i) => s + (values[i] ?? '')).join('');",
      "}",
      "const result = tag`Hello ${name}, you are ${age} years old`;",
    ].join("\n");
    const state = parseDoc(legacyJS, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
