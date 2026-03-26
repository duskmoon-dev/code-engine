// Moonlight theme — dark palette from @duskmoon-dev/core
import {EditorView} from "../core/view"
import {Extension} from "../core/state"
import {HighlightStyle, syntaxHighlighting} from "../core/language"
import {tags as t} from "../parser/highlight"

// Moonlight palette (OKLCH, from @duskmoon-dev/core [data-theme="moonlight"])
const neutral      = "oklch(85% 0 0)",
      gold         = "oklch(83% 0.098 74)",
      lavender     = "oklch(72% 0.090 255)",
      mauve        = "oklch(76% 0.130 336)",
      mint         = "oklch(82% 0.062 133)",
      periwinkle   = "oklch(82% 0.098 241)",
      warmAmber    = "oklch(76% 0.175 62)",
      muted        = "oklch(46% 0.190 29)",
      background   = "oklch(22% 0.019 238)",
      panels       = "oklch(18% 0.019 238)",
      activeLine   = "oklch(25% 0.019 238)",
      border       = "oklch(30% 0.02 238)",
      text         = "oklch(77% 0.043 245)",
      stone        = "oklch(50% 0.035 245)",
      selection    = "oklch(35% 0.040 245)",
      cursor       = neutral

/// The colors used in the Moonlight theme, as CSS color strings.
export const color = {
  neutral, gold, lavender, mauve, mint, periwinkle, warmAmber,
  muted, background, panels, activeLine, border, text, stone, selection, cursor,
}

/// Editor theme styles for Moonlight.
export const moonlightTheme = EditorView.theme({
  "&": {color: text, backgroundColor: background},
  ".cm-content": {caretColor: cursor},
  ".cm-cursor, .cm-dropCursor": {borderLeftColor: cursor},
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    {backgroundColor: `color-mix(in oklch, ${selection} 60%, transparent)`},
  ".cm-panels": {backgroundColor: panels, color: text},
  ".cm-panels.cm-panels-top": {borderBottom: `1px solid ${border}`},
  ".cm-panels.cm-panels-bottom": {borderTop: `1px solid ${border}`},
  ".cm-searchMatch": {backgroundColor: `color-mix(in oklch, ${warmAmber} 25%, transparent)`,
    outline: `1px solid ${warmAmber}`},
  ".cm-searchMatch.cm-searchMatch-selected": {backgroundColor: `color-mix(in oklch, ${warmAmber} 40%, transparent)`},
  ".cm-activeLine": {backgroundColor: activeLine},
  ".cm-selectionMatch": {backgroundColor: `color-mix(in oklch, ${selection} 70%, transparent)`},
  "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket":
    {backgroundColor: `color-mix(in oklch, ${lavender} 25%, transparent)`},
  ".cm-gutters": {backgroundColor: background, color: stone, border: "none"},
  ".cm-activeLineGutter": {backgroundColor: activeLine},
  ".cm-foldPlaceholder": {backgroundColor: "transparent", border: "none", color: stone},
  ".cm-tooltip": {border: `1px solid ${border}`, backgroundColor: panels},
  ".cm-tooltip .cm-tooltip-arrow:before": {borderTopColor: "transparent", borderBottomColor: "transparent"},
  ".cm-tooltip .cm-tooltip-arrow:after": {borderTopColor: panels, borderBottomColor: panels},
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {backgroundColor: lavender, color: "oklch(98% 0 0)"}
  }
}, {dark: true})

/// Syntax highlighting style for Moonlight.
export const moonlightHighlightStyle = HighlightStyle.define([
  {tag: t.keyword,                                                         color: lavender},
  {tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],    color: "oklch(75% 0.05 15)"},
  {tag: [t.function(t.variableName), t.labelName],                        color: periwinkle},
  {tag: [t.color, t.constant(t.name), t.standard(t.name)],                color: mauve},
  {tag: [t.definition(t.name), t.separator],                              color: text},
  {tag: [t.typeName, t.className, t.number, t.changed, t.annotation,
         t.modifier, t.self, t.namespace],                                 color: gold},
  {tag: [t.operator, t.operatorKeyword, t.url, t.escape,
         t.regexp, t.link, t.special(t.string)],                          color: neutral},
  {tag: [t.meta, t.comment],   color: stone, fontStyle: "italic"},
  {tag: t.strong,              fontWeight: "bold"},
  {tag: t.emphasis,            fontStyle: "italic"},
  {tag: t.strikethrough,       textDecoration: "line-through"},
  {tag: t.link,                color: periwinkle, textDecoration: "underline"},
  {tag: t.heading,             fontWeight: "bold", color: lavender},
  {tag: [t.atom, t.bool, t.special(t.variableName)],                      color: mauve},
  {tag: [t.processingInstruction, t.string, t.inserted],                  color: mint},
  {tag: t.invalid,             color: "oklch(98% 0 0)", backgroundColor: muted},
])

/// Combined Moonlight editor theme + highlight style.
export const moonlight: Extension = [moonlightTheme, syntaxHighlighting(moonlightHighlightStyle)]
