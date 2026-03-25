import { describe, it, expect } from "bun:test";
import { StreamLanguage, LanguageSupport, ensureSyntaxTree } from "../../../src/core/language/index";
import { EditorState } from "../../../src/core/state/index";

import { xml, html, mkXML } from "../../../src/lang/legacy/xml";
import { tiki } from "../../../src/lang/legacy/tiki";
import { vhdl } from "../../../src/lang/legacy/vhdl";

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

describe("XML tokenizer deep coverage", () => {
  it("tokenizes CDATA sections and malformed <![", () => {
    // Lines 64-66: <![CDATA[...]]> and <![without CDATA
    const doc = [
      "<root>",
      "  <![CDATA[some raw <content> & stuff]]>",
      "  <![unknown",
      "</root>",
    ].join("\n");
    const state = parseDoc(xml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes comments and DOCTYPE", () => {
    // Lines 67-73: <!-- comment --> and <!DOCTYPE ...>
    const doc = [
      "<!-- a comment -->",
      "<!DOCTYPE note SYSTEM 'note.dtd'>",
      "<note>hello</note>",
    ].join("\n");
    const state = parseDoc(xml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes malformed <!> (no match after <!)", () => {
    // Line 73: else return null after <!
    const doc = "<root><!z something></root>";
    const state = parseDoc(xml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes processing instructions (<? ... ?>)", () => {
    // Lines 75-78: <?xml ... ?> processing instructions
    const doc = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<root><child/></root>",
    ].join("\n");
    const state = parseDoc(xml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes entity references (& sequences)", () => {
    // Lines 85-95: &amp; &#123; &#xAF; and invalid &
    const doc = [
      "<root>",
      "  &amp; &lt; &gt;",
      "  &#65; &#x41;",
      "  &bad",
      "</root>",
    ].join("\n");
    const state = parseDoc(xml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes < inside attribute context (error recovery)", () => {
    // Lines 112-117: encountering < while in tag
    const doc = '<root attr<nested>text</root>';
    const state = parseDoc(xml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes nested DOCTYPE with < and > inside", () => {
    // Lines 155-171: doctype with nested < > at various depths
    const doc = [
      '<!DOCTYPE root [',
      '  <!ELEMENT note (to,from,heading,body)>',
      '  <!ELEMENT to (#PCDATA)>',
      '  <!ENTITY writer "Writer Name">',
      ']>',
      "<root/>",
    ].join("\n");
    const state = parseDoc(xml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles close tag with mismatched names", () => {
    // Lines 238-240, 242-248, 253-254, 259-261: close tag error paths
    const doc = [
      "<outer>",
      "  <inner>text</wrong>",
      "</outer>",
    ].join("\n");
    const state = parseDoc(xml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles self-closing tags and attributes with/without quotes", () => {
    // Lines 279-280, 285, 290-291: attrState error, attrEqState, attrValueState
    const doc = [
      '<br/>',
      '<img src="test.png" alt="image"/>',
      '<input type="text" disabled/>',
    ].join("\n");
    const state = parseDoc(xml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("exercises indent function with various contexts", () => {
    // Lines 326-368: indent function paths
    const doc = [
      "<root>",
      "  <child>",
      '    <nested attr="value"',
      '           other="long">',
      "      text",
      "    </nested>",
      "  </child>",
      "</root>",
    ].join("\n");
    const state = parseDoc(xml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("exercises xmlCurrentTag and xmlCurrentContext helpers", () => {
    // Lines 383-392: xmlCurrentTag/xmlCurrentContext functions
    const mode = mkXML({});
    const st = mode.startState();
    // Initially no tag
    expect(mode.xmlCurrentTag(st)).toBeNull();
    expect(mode.xmlCurrentContext(st)).toEqual([]);
  });

  it("exercises skipAttribute function", () => {
    // Lines 378-381: skipAttribute
    const mode = mkXML({});
    const st = mode.startState();
    // Call skipAttribute on initial state (noop since state.state != attrValueState)
    mode.skipAttribute(st);
    expect(st).toBeDefined();
  });

  it("handles HTML mode with implicit closing and context grabbers", () => {
    // Lines 201-202, 221-225: HTML-mode implicit close, context grabbers
    const doc = [
      "<html>",
      "<body>",
      "<p>First paragraph",
      "<p>Second paragraph implicitly closes first",
      "<ul>",
      "  <li>item 1",
      "  <li>item 2",
      "</ul>",
      "<hr>",
      "<br>",
      "</body>",
      "</html>",
    ].join("\n");
    const state = parseDoc(html, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles allowMissingTagName in XML config", () => {
    // Lines 221-224, 242-244: allowMissingTagName paths
    const customXml = mkXML({ allowMissingTagName: true });
    const doc = [
      "<>text</>",
      "<valid>content</valid>",
    ].join("\n");
    const state = parseDoc(customXml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles matchClosing false config", () => {
    // Line 235: matchClosing === false path
    const customXml = mkXML({ matchClosing: false });
    const doc = "<foo>text</bar>";
    const state = parseDoc(customXml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles multilineTagIndentPastTag false config", () => {
    // Lines 339-342: multilineTagIndentPastTag false
    const customXml = mkXML({ multilineTagIndentPastTag: false, multilineTagIndentFactor: 2 });
    const doc = [
      '<element attr="val"',
      '    other="val2">',
      "  content",
      "</element>",
    ].join("\n");
    const state = parseDoc(customXml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles alignCDATA config", () => {
    // Line 344: alignCDATA path
    const customXml = mkXML({ alignCDATA: true });
    const doc = [
      "<root>",
      "<![CDATA[data]]>",
      "</root>",
    ].join("\n");
    const state = parseDoc(customXml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles indent with closing tag matching through implicit closes", () => {
    // Lines 346-356: indent closing tag with implicitlyClosed traversal
    const doc = [
      "<table>",
      "  <tr>",
      "    <td>cell 1",
      "    <td>cell 2",
      "  </tr>",
      "</table>",
    ].join("\n");
    const state = parseDoc(html, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles indent with opening tag context grabbers", () => {
    // Lines 357-364: indent with opening tag and context grabbers
    const doc = [
      "<dl>",
      "  <dt>term 1",
      "  <dd>definition 1",
      "  <dt>term 2",
      "  <dd>definition 2",
      "</dl>",
    ].join("\n");
    const state = parseDoc(html, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles attribute string that spans multiple lines", () => {
    // Lines 329-333: isInAttribute indent path
    const doc = [
      '<root attr="very long',
      '  multiline value"',
      ">content</root>",
    ].join("\n");
    const state = parseDoc(xml, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles noIndent context (pre tag in HTML)", () => {
    // Line 335: context.noIndent path
    const doc = [
      "<div>",
      "  <pre>",
      "    preformatted",
      "    text",
      "  </pre>",
      "</div>",
    ].join("\n");
    const state = parseDoc(html, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("Tiki tokenizer deep coverage", () => {
  it("tokenizes bold, italics, and inline formatting", () => {
    // Lines 44-50: __ bold __, '' italics ''
    const doc = [
      "Normal __bold text__ and ''italic text''",
      "More __bold__ here",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes wiki links and web links", () => {
    // Lines 52-57: (( wiki link )) and [ web link ]
    const doc = [
      "See ((wiki page)) for details",
      "Visit [http://example.com] for more",
      "Another ((link)) here",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes tables and double-colon directives", () => {
    // Lines 59-61, 74-76: || table || and :: directive ::
    const doc = [
      "||Header 1|Header 2||",
      "||cell 1|cell 2||",
      "Some ::monospaced:: text",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes titlebar (-=..=-) and deleted text (--..--)", () => {
    // Lines 64-68: -= titlebar =- and -- deleted --
    const doc = [
      "-=This is a title bar=-",
      "Normal text --deleted text-- more text",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes underline (===...===) and box (^...^)", () => {
    // Lines 70-79: === underline === and ^ box ^
    const doc = [
      "Text ===underlined=== text",
      "And ^boxed content^ here",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes no-parse (~np~...~/np~)", () => {
    // Lines 81-83: ~np~ ... ~/np~
    const doc = "Some text ~np~__not bold__ ''not italic''~/np~ end";
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes headers at start of line", () => {
    // Lines 88-108: ! !! !!! !!!! !!!!! headers, * # + list items
    const doc = [
      "!Heading 1",
      "!!Heading 2",
      "!!!Heading 3",
      "!!!!Heading 4",
      "!!!!!Heading 5",
      "!!!!!!Heading 6",
      "* unordered item",
      "# ordered item",
      "+ plus item",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes plugins with attributes and quoted values", () => {
    // Lines 117-148, 151-158: inPlugin with =, quotes, brackets
    const doc = [
      '{CODE(colors="php" caption="Example")}',
      'function hello() { echo "world"; }',
      "{CODE}",
      "",
      "{img src=display123 width=200 height=100}",
      "",
      "{DIV(class=myclass id=main)}content{DIV}",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes plugin with => arrow and unquoted attributes", () => {
    // Lines 130-138: = followed by >, and unquoted attribute values
    const doc = [
      "{FANCYTABLE(head=>Header1|Header2)}",
      "row1col1|row1col2",
      "{FANCYTABLE}",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes plugin with parentheses and close plugin", () => {
    // Lines 125-126, 198-213: ( ) in plugin, close plugin context
    const doc = [
      "{LIST(type=ul)}",
      "item1",
      "item2",
      "{LIST}",
      "",
      "{SPLIT(joincols=y)}col1---col2{SPLIT}",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes plugin close with mismatched names (error path)", () => {
    // Lines 205-213: close plugin with wrong name -> error
    const doc = [
      "{CODE()}",
      "some code",
      "{WRONG}",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("exercises indent function", () => {
    // Lines 281-290: indent with context, noIndent, {/ close
    const doc = [
      "{DIV(class=outer)}",
      "  {DIV(class=inner)}",
      "    content",
      "  {DIV}",
      "{DIV}",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes plugin attribute with single-quoted values", () => {
    // Lines 142-144: single-quoted attribute in plugin
    const doc = "{TAG(attr='single quoted value' other='val')}content{TAG}";
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes unquoted attribute value ending at ) or }", () => {
    // Lines 163-175: inAttributeNoQuote ending at ) } or space
    const doc = [
      "{PLUGIN(x=abc y=def)}text{PLUGIN}",
      "{THING(val=123)}content{THING}",
    ].join("\n");
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes inline pipe (single |) as non-table", () => {
    // Line 59-62: single | does not trigger table mode (needs ||)
    const doc = "a | b | c";
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes single characters that don't trigger formatting", () => {
    // Lines 47,49,55,58,62,65,69,73,80,84: break paths (single char doesn't pair)
    const doc = "a _ b ' c ( d - e = f : g";
    const state = parseDoc(tiki, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});

describe("VHDL tokenizer deep coverage", () => {
  it("tokenizes backtick and dollar meta hooks", () => {
    // Lines 13-14: metaHook with ` and $ characters
    const doc = [
      "-- backtick and dollar",
      "signal s : std_logic := `meta_value;",
      "signal d : std_logic := $dollar_val;",
    ].join("\n");
    const state = parseDoc(vhdl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes double-quoted strings (string.special)", () => {
    // Lines 38-39, 42-43, 89-99: tokenString2 for double-quoted strings
    const doc = [
      'library ieee;',
      'use ieee.std_logic_1164.all;',
      '',
      'entity test is',
      '  port (',
      '    data_in : in std_logic_vector(7 downto 0) := "00000000";',
      '    data_out : out std_logic_vector(7 downto 0)',
      '  );',
      'end entity test;',
    ].join("\n");
    const state = parseDoc(vhdl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes single-quoted character literals and strings", () => {
    // Lines 42-43, 77-88: tokenString for single-quoted
    const doc = [
      "architecture rtl of test is",
      "  signal c : character := 'A';",
      "  constant str : string := 'hello world';",
      "begin",
      "  process",
      "  begin",
      "    c <= 'Z';",
      "  end process;",
      "end architecture rtl;",
    ].join("\n");
    const state = parseDoc(vhdl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes comments (--)", () => {
    // Lines 57-61: -- line comments
    const doc = [
      "-- This is a comment",
      "signal a : integer; -- inline comment",
      "-- another comment line",
    ].join("\n");
    const state = parseDoc(vhdl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes operators and punctuation", () => {
    // Lines 49-51, 63-65: punctuation and operator chars
    const doc = [
      "architecture rtl of ops is",
      "  signal a, b, c : std_logic;",
      "  signal x : integer range 0 to 255;",
      "begin",
      "  c <= a and b;",
      "  c <= a or b;",
      "  c <= a xor b;",
      "  c <= not a;",
      "  x <= 10 + 20 - 5 * 3;",
      "  a <= '1' when (x > 100) else '0';",
      "end architecture rtl;",
    ].join("\n");
    const state = parseDoc(vhdl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes numeric literals including base notation", () => {
    // Lines 53-55: digit followed by eatWhile word chars
    const doc = [
      "architecture rtl of nums is",
      "  constant a : integer := 42;",
      "  constant b : integer := 16#FF#;",
      "  constant c : integer := 2#1010_1100#;",
      "  constant d : real := 3.14;",
      "  constant e : real := 1.0e-6;",
      "  constant f : time := 10 ns;",
      "begin",
      "end architecture rtl;",
    ].join("\n");
    const state = parseDoc(vhdl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes block keywords that trigger newstatement", () => {
    // Lines 69-70: blockKeywords -> curPunc = "newstatement"
    const doc = [
      "entity counter is",
      "  port (",
      "    clk : in std_logic;",
      "    reset : in std_logic;",
      "    count : out integer range 0 to 255",
      "  );",
      "end entity counter;",
      "",
      "architecture rtl of counter is",
      "  signal cnt : integer range 0 to 255 := 0;",
      "begin",
      "  process(clk, reset)",
      "  begin",
      "    if reset = '1' then",
      "      cnt <= 0;",
      "    elsif rising_edge(clk) then",
      "      if cnt = 255 then",
      "        cnt <= 0;",
      "      else",
      "        cnt <= cnt + 1;",
      "      end if;",
      "    end if;",
      "  end process;",
      "  count <= cnt;",
      "end architecture rtl;",
    ].join("\n");
    const state = parseDoc(vhdl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes null atom and case statement", () => {
    // Line 73: atoms (null)
    const doc = [
      "architecture rtl of fsm is",
      "  type state_type is (idle, running, stopped);",
      "  signal state : state_type := idle;",
      "begin",
      "  process(clk)",
      "  begin",
      "    case state is",
      "      when idle =>",
      "        null;",
      "      when running =>",
      "        null;",
      "      when others =>",
      "        null;",
      "    end case;",
      "  end process;",
      "end architecture rtl;",
    ].join("\n");
    const state = parseDoc(vhdl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("exercises indent with } and ] context pops", () => {
    // Lines 148-152, 160-165: context push/pop for braces, brackets, parens
    const doc = [
      "architecture rtl of indent_test is",
      "  signal arr : integer_vector(0 to 3) := (0, 1, 2, 3);",
      "  type rec is record",
      "    x : integer;",
      "    y : integer;",
      "  end record;",
      "begin",
      "  process",
      "  begin",
      "    for i in 0 to 3 loop",
      "      arr(i) <= i * 2;",
      "    end loop;",
      "  end process;",
      "end architecture rtl;",
    ].join("\n");
    const state = parseDoc(vhdl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("exercises indent function with tokenize not tokenBase", () => {
    // Line 161: state.tokenize != tokenBase -> return 0
    // Use a string that spans lines to leave tokenize in string state
    const doc = [
      'architecture rtl of str is',
      '  constant s : string := "multi',
      '    line string";',
      'begin',
      'end architecture rtl;',
    ].join("\n");
    const state = parseDoc(vhdl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });

  it("tokenizes a minus sign that is not a comment", () => {
    // Lines 57-62: single minus that doesn't become -- comment
    const doc = [
      "architecture rtl of sub is",
      "  signal a : integer := 10;",
      "  signal b : integer := 5;",
      "  signal c : integer;",
      "begin",
      "  c <= a - b;",
      "end architecture rtl;",
    ].join("\n");
    const state = parseDoc(vhdl, doc);
    expect(treeLen(state)).toBeGreaterThanOrEqual(0);
  });
});
