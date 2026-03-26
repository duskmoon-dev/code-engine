// Sunshine theme — light palette from @duskmoon-dev/core
import {EditorView} from "../core/view"
import {Extension} from "../core/state"
import {HighlightStyle, syntaxHighlighting} from "../core/language"
import {tags as t} from "../parser/highlight"

// Sunshine palette (OKLCH, from @duskmoon-dev/core [data-theme="sunshine"])
const amber        = "oklch(72% 0.17 75)",    // primary — warm amber
      coral        = "oklch(62% 0.19 20)",    // secondary — coral rose
      violet       = "oklch(80% 0.085 235)",  // tertiary — soft violet
      mint         = "oklch(67% 0.19 134)",   // success — green
      gold         = "oklch(68% 0.20 42)",    // warning — amber-gold
      sky          = "oklch(42% 0.114 254)",  // info — sky blue
      error        = "oklch(61% 0.237 28)",   // error — red
      background   = "oklch(100% 0.005 255)", // base-100 — near white
      panels       = "oklch(96% 0.005 255)",  // slightly off-white panels
      text         = "oklch(10% 0 255)",      // base-content — near black
      stone        = "oklch(55% 0.02 260)",   // muted comment grey
      highlight    = "oklch(85% 0.10 75)",    // search highlight
      selection    = "oklch(80% 0.08 75)"     // selection amber-tinted

const activeLine   = "oklch(97% 0.008 75)",  // active line / gutter highlight
      border       = "oklch(88% 0.01 255)",  // panel borders and tooltip border
      selectedText = "oklch(15% 0 0)"        // text color on selected autocomplete item

/// The colors used in the Sunshine theme, as CSS color strings.
export const sunshineColor = {
  amber,
  coral,
  violet,
  mint,
  gold,
  sky,
  error,
  background,
  panels,
  text,
  stone,
  highlight,
  selection,
}

/// Editor theme styles for Sunshine.
export const sunshineTheme = EditorView.theme({
  "&": {color: text, backgroundColor: background},
  ".cm-content": {caretColor: amber},
  ".cm-cursor, .cm-dropCursor": {borderLeftColor: amber},
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    {backgroundColor: `color-mix(in oklch, ${selection} 35%, transparent)`},
  ".cm-panels": {backgroundColor: panels, color: text},
  ".cm-panels.cm-panels-top": {borderBottom: `1px solid ${border}`},
  ".cm-panels.cm-panels-bottom": {borderTop: `1px solid ${border}`},
  ".cm-searchMatch": {backgroundColor: `color-mix(in oklch, ${highlight} 40%, transparent)`,
    outline: `1px solid ${highlight}`},
  ".cm-searchMatch.cm-searchMatch-selected": {backgroundColor: `color-mix(in oklch, ${amber} 30%, transparent)`},
  ".cm-activeLine": {backgroundColor: activeLine},
  ".cm-selectionMatch": {backgroundColor: `color-mix(in oklch, ${amber} 15%, transparent)`},
  "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket":
    {backgroundColor: `color-mix(in oklch, ${amber} 25%, transparent)`},
  ".cm-gutters": {backgroundColor: background, color: stone, border: "none"},
  ".cm-activeLineGutter": {backgroundColor: activeLine},
  ".cm-foldPlaceholder": {backgroundColor: "transparent", border: "none", color: stone},
  ".cm-tooltip": {border: `1px solid ${border}`, backgroundColor: background},
  ".cm-tooltip .cm-tooltip-arrow:before": {borderTopColor: "transparent", borderBottomColor: "transparent"},
  ".cm-tooltip .cm-tooltip-arrow:after": {borderTopColor: background, borderBottomColor: background},
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {backgroundColor: amber, color: selectedText}
  }
}, {dark: false})

/// Syntax highlighting style for Sunshine.
export const sunshineHighlightStyle = HighlightStyle.define([
  {tag: t.keyword,                                                         color: coral},
  {tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],    color: "oklch(35% 0.12 20)"},
  {tag: [t.function(t.variableName), t.labelName],                        color: sky},
  {tag: [t.color, t.constant(t.name), t.standard(t.name)],                color: violet},
  {tag: [t.definition(t.name), t.separator],                              color: text},
  {tag: [t.typeName, t.className, t.number, t.changed, t.annotation,
         t.modifier, t.self, t.namespace],                                 color: gold},
  {tag: [t.operator, t.operatorKeyword, t.url, t.escape,
         t.regexp, t.link, t.special(t.string)],                          color: amber},
  {tag: [t.meta, t.comment],   color: stone, fontStyle: "italic"},
  {tag: t.strong,              fontWeight: "bold"},
  {tag: t.emphasis,            fontStyle: "italic"},
  {tag: t.strikethrough,       textDecoration: "line-through"},
  {tag: t.link,                color: sky, textDecoration: "underline"},
  {tag: t.heading,             fontWeight: "bold", color: coral},
  {tag: [t.atom, t.bool, t.special(t.variableName)],                      color: violet},
  {tag: [t.processingInstruction, t.string, t.inserted],                  color: mint},
  {tag: t.invalid,             color: "oklch(100% 0 0)", backgroundColor: error},
])

/// Combined Sunshine editor theme + highlight style.
export const sunshine: Extension = [sunshineTheme, syntaxHighlighting(sunshineHighlightStyle)]
