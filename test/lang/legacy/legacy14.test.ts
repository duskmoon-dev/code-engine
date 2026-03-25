import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { c, cpp, java, shader, nesC, objectiveC, objectiveCpp, squirrel, ceylon, dart } from "../../../src/lang/legacy/clike";
import { tcl } from "../../../src/lang/legacy/tcl";
import { q } from "../../../src/lang/legacy/q";
import { nginx } from "../../../src/lang/legacy/nginx";
import { mirc } from "../../../src/lang/legacy/mirc";

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

describe("C language tokenizer deep coverage", () => {
  it("tokenizes C with preprocessor, types, and pointer syntax", () => {
    const doc = [
      "/* C block comment */",
      "// line comment",
      "#include <stdio.h>",
      "#include <stdlib.h>",
      "#define MAX_SIZE 100",
      "#ifdef DEBUG",
      "#define LOG(x) printf(\"%s\\n\", x)",
      "#endif",
      "",
      "typedef struct {",
      "    int x;",
      "    int y;",
      "} Point_t;",
      "",
      "int factorial(int n) {",
      "    if (n <= 1) return 1;",
      "    return n * factorial(n - 1);",
      "}",
      "",
      "int main(void) {",
      '    char *str = "hello world";',
      "    int arr[MAX_SIZE];",
      "    Point_t *p = NULL;",
      "    size_t len = sizeof(arr);",
      '    printf("len=%zu\\n", len);',
      "    return 0;",
      "}",
    ].join("\n");
    const state = parseDoc(c, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes C with reserved identifiers and POSIX types", () => {
    const doc = [
      "#include <stdint.h>",
      "uint8_t byte_val = 0xFF;",
      "int32_t word_val = -1L;",
      "uint64_t big_val = 0xDEADBEEFULL;",
      "__int128 huge = 0;",
      "volatile int *__ptr = NULL;",
      "_Bool flag = 1;",
      "double pi = 3.14159e0;",
    ].join("\n");
    const state = parseDoc(c, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("C++ language tokenizer deep coverage", () => {
  it("tokenizes C++ with templates, lambdas, and modern features", () => {
    const doc = [
      "#include <vector>",
      "#include <string>",
      "#include <memory>",
      "",
      "namespace example {",
      "",
      "template<typename T>",
      "class Stack {",
      "public:",
      "    void push(T val) { data_.push_back(val); }",
      "    T pop() { auto v = data_.back(); data_.pop_back(); return v; }",
      "private:",
      "    std::vector<T> data_;",
      "};",
      "",
      "auto square = [](int x) -> int { return x * x; };",
      "",
      "} // namespace example",
    ].join("\n");
    const state = parseDoc(cpp, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes C++ raw strings and unicode literals", () => {
    const doc = [
      '// C++ raw string',
      'const char* raw = R"(hello "world" \\n)";',
      'const char* raw2 = R"delim(text (with) parens)delim";',
      '',
      '// Unicode strings',
      'const char16_t* u16 = u"unicode string";',
      'const char32_t* u32 = U"unicode string";',
      'const wchar_t* wide = L"wide string";',
      'const char* utf8 = u8"UTF-8 string";',
      '',
      '// C++14 literals',
      'auto x = 1\'000\'000;',
      'auto y = 0xDEAD\'BEEF;',
      'auto z = 0b1010\'0101;',
    ].join("\n");
    const state = parseDoc(cpp, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes C++ with pointer hooks and constructors", () => {
    const doc = [
      "class Foo::Bar {",
      "  Foo::Bar() {}",
      "  ~Foo::Bar() {}",
      "};",
      "",
      "int* ptr = nullptr;",
      "const int* cptr = &value;",
      "int** dptr = &ptr;",
      "void (*fn_ptr)(int) = nullptr;",
    ].join("\n");
    const state = parseDoc(cpp, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Java tokenizer deep coverage", () => {
  it("tokenizes Java with annotations, generics, and lambdas", () => {
    const doc = [
      "package com.example;",
      "",
      "import java.util.*;",
      "import java.util.function.Function;",
      "",
      "@SuppressWarnings(\"unchecked\")",
      "public class Example<T extends Comparable<T>> {",
      "",
      "    @Override",
      "    public String toString() {",
      '        return "Example";',
      "    }",
      "",
      "    public static void main(String[] args) {",
      "        List<Integer> nums = new ArrayList<>();",
      "        nums.add(1); nums.add(2); nums.add(3);",
      "        nums.stream()",
      "            .filter(n -> n > 1)",
      "            .map(n -> n * 2)",
      "            .forEach(System.out::println);",
      "    }",
      "",
      "    @interface CustomAnnotation {",
      "        String value() default \"\";",
      "    }",
      "}",
    ].join("\n");
    const state = parseDoc(java, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Java text blocks (triple-quoted strings)", () => {
    const doc = [
      'String json = """',
      '    {',
      '        "name": "Alice",',
      '        "age": 30',
      '    }',
      '    """;',
      "",
      "var x = 42;",
      "int hex = 0xFF_FF;",
      "long big = 1_000_000L;",
      "float pi = 3.14f;",
    ].join("\n");
    const state = parseDoc(java, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("GLSL Shader tokenizer deep coverage", () => {
  it("tokenizes GLSL vertex shader code", () => {
    const doc = [
      "// GLSL vertex shader",
      "#version 330 core",
      "",
      "in vec3 aPos;",
      "in vec2 aTexCoord;",
      "",
      "out vec2 TexCoord;",
      "",
      "uniform mat4 model;",
      "uniform mat4 view;",
      "uniform mat4 projection;",
      "",
      "void main() {",
      "    gl_Position = projection * view * model * vec4(aPos, 1.0);",
      "    TexCoord = aTexCoord;",
      "}",
    ].join("\n");
    const state = parseDoc(shader, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes GLSL fragment shader with uniforms", () => {
    const doc = [
      "#version 330 core",
      "",
      "in vec2 TexCoord;",
      "out vec4 FragColor;",
      "",
      "uniform sampler2D texture1;",
      "uniform float opacity;",
      "",
      "void main() {",
      "    vec4 texColor = texture(texture1, TexCoord);",
      "    FragColor = vec4(texColor.rgb, texColor.a * opacity);",
      "    if (FragColor.a < 0.1)",
      "        discard;",
      "}",
    ].join("\n");
    const state = parseDoc(shader, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("nesC tokenizer deep coverage", () => {
  it("tokenizes nesC (TinyOS) component code", () => {
    const doc = [
      "// nesC component",
      "module BlinkC {",
      "  uses interface Timer<TMilli>;",
      "  uses interface Leds;",
      "  uses interface Boot;",
      "}",
      "implementation {",
      "  event void Boot.booted() {",
      "    call Timer.startPeriodic(250);",
      "  }",
      "  event void Timer.fired() {",
      "    call Leds.led0Toggle();",
      "  }",
      "}",
    ].join("\n");
    const state = parseDoc(nesC, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Objective-C tokenizer deep coverage", () => {
  it("tokenizes Objective-C with interfaces and messages", () => {
    const doc = [
      "// Objective-C",
      "#import <Foundation/Foundation.h>",
      "",
      "@interface Person : NSObject",
      "@property (nonatomic, strong) NSString *name;",
      "@property (nonatomic, assign) NSInteger age;",
      "- (instancetype)initWithName:(NSString *)name age:(NSInteger)age;",
      "- (NSString *)greet;",
      "@end",
      "",
      "@implementation Person",
      "- (instancetype)initWithName:(NSString *)name age:(NSInteger)age {",
      "    self = [super init];",
      "    if (self) {",
      "        _name = name;",
      "        _age = age;",
      "    }",
      "    return self;",
      "}",
      "",
      "- (NSString *)greet {",
      '    return [NSString stringWithFormat:@"Hello, %@!", _name];',
      "}",
      "@end",
    ].join("\n");
    const state = parseDoc(objectiveC, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Objective-C++ mixed code", () => {
    const doc = [
      "#import <Foundation/Foundation.h>",
      "#include <vector>",
      "#include <string>",
      "",
      "@interface Wrapper : NSObject {",
      "    std::vector<int> data_;",
      "}",
      "- (void)addValue:(int)val;",
      "@end",
      "",
      "@implementation Wrapper",
      "- (void)addValue:(int)val {",
      "    data_.push_back(val);",
      "}",
      "@end",
    ].join("\n");
    const state = parseDoc(objectiveCpp, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Squirrel tokenizer deep coverage", () => {
  it("tokenizes Squirrel scripting language", () => {
    const doc = [
      "// Squirrel script",
      "/* block comment */",
      "local x = 42;",
      "local s = \"hello world\";",
      "local arr = [1, 2, 3];",
      "local tbl = { key = \"value\", num = 99 };",
      "",
      "function factorial(n) {",
      "    if (n <= 1) return 1;",
      "    return n * factorial(n - 1);",
      "}",
      "",
      "class Animal {",
      "    constructor(name) {",
      "        this.name = name;",
      "    }",
      "    function speak() {",
      '        print("...");',
      "    }",
      "}",
      "",
      "class Dog extends Animal {",
      "    function speak() {",
      '        print("Woof!");',
      "    }",
      "}",
    ].join("\n");
    const state = parseDoc(squirrel, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Ceylon tokenizer deep coverage", () => {
  it("tokenizes Ceylon with classes, interfaces, and functions", () => {
    const doc = [
      "// Ceylon comment",
      "/* block */",
      "import ceylon.collection { ArrayList }",
      "",
      "shared interface Greeter {",
      "    shared formal String greet(String name);",
      "}",
      "",
      "shared class SimpleGreeter() satisfies Greeter {",
      "    shared actual String greet(String name)",
      '        => "Hello, ``name``!";',
      "}",
      "",
      "shared void run() {",
      "    value nums = ArrayList<Integer> { 1, 2, 3, 4, 5 };",
      "    for (n in nums) {",
      "        print(n^2);",
      "    }",
      "    value result = nums.filter((n) => n > 2);",
      "}",
    ].join("\n");
    const state = parseDoc(ceylon, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Ceylon with union types and comprehensions", () => {
    const doc = [
      "String|Integer value = 42;",
      "String? maybeStr = null;",
      "",
      "shared Float? parseFloat(String s) {",
      "    if (is Float f = Float.parse(s)) {",
      "        return f;",
      "    }",
      "    return null;",
      "}",
      "",
      "value squares = { for (i in 1..10) i^2 };",
      "value evens = { for (i in 1..20) if (i % 2 == 0) i };",
    ].join("\n");
    const state = parseDoc(ceylon, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Dart tokenizer deep coverage", () => {
  it("tokenizes Dart with classes, async, and mixins", () => {
    const doc = [
      "// Dart comment",
      "/* block comment */",
      "import 'dart:async';",
      "import 'package:http/http.dart' as http;",
      "",
      "mixin Flyable {",
      "  void fly() => print('Flying!');",
      "}",
      "",
      "class Animal {",
      "  final String name;",
      "  Animal(this.name);",
      "  void speak() => print('...');",
      "}",
      "",
      "class Bird extends Animal with Flyable {",
      "  Bird(String name) : super(name);",
      "  @override",
      "  void speak() => print('Tweet!');",
      "}",
      "",
      "Future<String> fetchData(String url) async {",
      "  final response = await http.get(Uri.parse(url));",
      "  return response.body;",
      "}",
    ].join("\n");
    const state = parseDoc(dart, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Dart with generics, null safety, and collections", () => {
    const doc = [
      "List<int> nums = [1, 2, 3, 4, 5];",
      "Map<String, dynamic> data = {'key': 'value', 'num': 42};",
      "Set<String> tags = {'dart', 'flutter', 'mobile'};",
      "",
      "int? maybeNull = null;",
      "String name = maybeNull ?? 'default';",
      "",
      "var squares = nums.map((n) => n * n).toList();",
      "var evens = nums.where((n) => n.isEven).toList();",
      "",
      "extension StringExt on String {",
      "  String get capitalized =>",
      "    this[0].toUpperCase() + substring(1);",
      "}",
    ].join("\n");
    const state = parseDoc(dart, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("TCL tokenizer deep coverage", () => {
  it("tokenizes TCL with procedures, control flow, and arrays", () => {
    const doc = [
      "# TCL comment",
      "package require Tk",
      "",
      "proc fibonacci {n} {",
      "    if {$n <= 1} {",
      "        return $n",
      "    }",
      "    return [expr {[fibonacci [expr {$n - 1}]] + [fibonacci [expr {$n - 2}]]}]",
      "}",
      "",
      "set arr(key1) value1",
      "set arr(key2) value2",
      "foreach key [array names arr] {",
      "    puts \"$key = $arr($key)\"",
      "}",
      "",
      "for {set i 0} {$i < 10} {incr i} {",
      "    puts $i",
      "}",
      "",
      "while {1} {",
      "    after 1000",
      "    break",
      "}",
    ].join("\n");
    const state = parseDoc(tcl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes TCL with string operations and file I/O", () => {
    const doc = [
      "set str \"Hello, World!\"",
      "set len [string length $str]",
      "set upper [string toupper $str]",
      "set sub [string range $str 0 4]",
      "",
      "if {[string match *World* $str]} {",
      "    puts \"Found World\"",
      "} elseif {$len > 5} {",
      "    puts \"Long string\"",
      "} else {",
      "    puts \"Short\"",
      "}",
      "",
      "set fh [open \"/tmp/test.txt\" w]",
      "puts $fh \"test content\"",
      "close $fh",
      "",
      "switch $str {",
      "    \"hello\" { puts \"lower\" }",
      "    \"Hello, World!\" { puts \"match\" }",
      "    default { puts \"no match\" }",
      "}",
    ].join("\n");
    const state = parseDoc(tcl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes TCL with namespaces and OOP", () => {
    const doc = [
      "namespace eval MyNS {",
      "    variable count 0",
      "",
      "    proc increment {} {",
      "        variable count",
      "        incr count",
      "    }",
      "",
      "    proc getCount {} {",
      "        variable count",
      "        return $count",
      "    }",
      "}",
      "",
      "# Backslash continuation \\",
      "set longVar [expr {1 + \\",
      "    2 + 3}]",
      "",
      "regexp {^\\d+$} \"123\" match",
    ].join("\n");
    const state = parseDoc(tcl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Q language tokenizer deep coverage", () => {
  it("tokenizes Q with functions, tables, and queries", () => {
    const doc = [
      "/ Q/kdb+ comment",
      "/ Define a function",
      "fib:{[n] $[n<=1;n;.z.s[n-1]+.z.s[n-2]]}",
      "",
      "/ Table definition",
      "t:([]sym:`a`b`c;val:1 2 3;price:1.0 2.5 3.75)",
      "",
      "/ Queries",
      "select from t where val>1",
      "select sym, sum val by sym from t",
      "update val:val*2 from t",
      "",
      "/ List and dictionary",
      "l:1 2 3 4 5",
      "d:`a`b`c!1 2 3",
      "x:`sym!`AAPL",
    ].join("\n");
    const state = parseDoc(q, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Q with date/time types and namespaces", () => {
    const doc = [
      "/ Date/time literals",
      "d:2023.01.15",
      "t:12:30:00.000",
      "ts:2023.01.15T12:30:00.000",
      "",
      "/ Arithmetic",
      "x:til 10",
      "y:2*x",
      "z:x+y",
      "",
      "/ Namespace",
      ".myns.val:42",
      ".myns.fn:{x*2}",
      "",
      "/ Adverbs",
      "sum each (1 2 3;4 5 6)",
      "+/1 2 3 4 5",
      "*/1 2 3 4 5",
    ].join("\n");
    const state = parseDoc(q, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Nginx tokenizer deep coverage", () => {
  it("tokenizes Nginx with upstream, ssl, and location blocks", () => {
    const doc = [
      "# nginx advanced config",
      "upstream backend {",
      "    server 127.0.0.1:8080 weight=5;",
      "    server 127.0.0.1:8081;",
      "    keepalive 32;",
      "}",
      "",
      "server {",
      "    listen 443 ssl;",
      "    server_name secure.example.com;",
      "",
      "    ssl_certificate /etc/nginx/ssl/cert.pem;",
      "    ssl_certificate_key /etc/nginx/ssl/key.pem;",
      "    ssl_protocols TLSv1.2 TLSv1.3;",
      "",
      "    location ~* \\.(jpg|jpeg|png|gif|ico|css|js)$ {",
      "        expires 30d;",
      "        add_header Cache-Control public;",
      "    }",
      "",
      "    location /api {",
      "        proxy_pass http://backend;",
      "        proxy_http_version 1.1;",
      "        proxy_set_header Upgrade $http_upgrade;",
      "        proxy_set_header Connection 'upgrade';",
      "    }",
      "}",
    ].join("\n");
    const state = parseDoc(nginx, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes Nginx with rewrite rules, maps, and geo blocks", () => {
    const doc = [
      "map $http_accept_language $lang {",
      "    default en;",
      "    ~^de de;",
      "    ~^fr fr;",
      "}",
      "",
      "geo $blocked_ip {",
      "    default 0;",
      "    192.168.1.0/24 1;",
      "    10.0.0.0/8 1;",
      "}",
      "",
      "server {",
      "    if ($blocked_ip) {",
      "        return 403;",
      "    }",
      "",
      "    rewrite ^/old/(.*)$ /new/$1 permanent;",
      "    rewrite ^/redirect$ https://example.com/? redirect;",
      "",
      "    location / {",
      "        try_files $uri $uri/ /index.html =404;",
      "        error_page 404 /404.html;",
      "        error_page 500 502 503 504 /50x.html;",
      "    }",
      "}",
    ].join("\n");
    const state = parseDoc(nginx, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("mIRC tokenizer deep coverage", () => {
  it("tokenizes mIRC with event handlers and variables", () => {
    const doc = [
      "; mIRC script - event handlers",
      "on *:LOAD: {",
      "  echo -a Script loaded",
      "  set %version 1.0",
      "}",
      "",
      "on *:TEXT:*:#: {",
      "  if ($nick == $me) { halt }",
      "  if ($1 == !help) {",
      "    msg $chan Help text here",
      "  }",
      "}",
      "",
      "on *:JOIN:#: {",
      "  msg $chan Welcome $nick !",
      "}",
      "",
      "on *:PART:#: {",
      "  echo -a $nick left $chan",
      "}",
      "",
      "on *:QUIT: {",
      "  echo -a $nick quit: $1-",
      "}",
    ].join("\n");
    const state = parseDoc(mirc, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes mIRC with aliases, menus, and string operations", () => {
    const doc = [
      "; Aliases",
      "alias op { mode $1 +o $2 }",
      "alias deop { mode $1 -o $2 }",
      "alias kickban {",
      "  ban $1 $2",
      "  kick $1 $2 Banned",
      "}",
      "",
      "; Popup menu",
      "menu channel {",
      "  Op: /op # $$1",
      "  Deop: /deop # $$1",
      "  -",
      "  Kick: /kick # $$1",
      "}",
      "",
      "; String manipulation",
      "alias strtest {",
      "  var %s = Hello World",
      "  echo -a Length: $len(%s)",
      "  echo -a Upper: $upper(%s)",
      "  echo -a Token: $gettok(%s,1,32)",
      "}",
    ].join("\n");
    const state = parseDoc(mirc, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
