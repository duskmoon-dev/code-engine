// [DUSKMOON] DuskMoonUI native theme — not from upstream
// Reads CSS custom properties from the host document for integration with DuskMoonUI

import {EditorView} from "../core/view/index"
import {HighlightStyle, syntaxHighlighting} from "../core/language/index"
import {tags} from "../parser/highlight/index"
import type {Extension} from "../core/state/index"

/// A CodeMirror theme that reads DuskMoonUI CSS custom properties
/// from the host element's context. This allows the editor to
/// automatically match the surrounding DuskMoonUI design system.
export function duskMoonTheme(options: {dark?: boolean} = {}): Extension {
  const dark = options.dark ?? false
  const theme = EditorView.theme({
    "&": {
      color: "var(--color-text, inherit)",
      backgroundColor: "var(--color-surface, transparent)",
      fontFamily: "var(--font-mono, monospace)",
      fontSize: "var(--font-size-sm, 14px)",
    },
    ".cm-content": {
      caretColor: "var(--color-primary, #528bff)",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--color-primary, #528bff)",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "var(--color-selection, rgba(82, 139, 255, 0.3))",
    },
    ".cm-panels": {
      backgroundColor: "var(--color-surface-alt, #f5f5f5)",
      color: "var(--color-text, inherit)",
    },
    ".cm-panels.cm-panels-top": {
      borderBottom: "1px solid var(--color-border, #ddd)",
    },
    ".cm-panels.cm-panels-bottom": {
      borderTop: "1px solid var(--color-border, #ddd)",
    },
    ".cm-searchMatch": {
      backgroundColor: "var(--color-highlight, rgba(255, 215, 0, 0.4))",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "var(--color-highlight-active, rgba(255, 150, 50, 0.4))",
    },
    ".cm-activeLine": {
      backgroundColor: "var(--color-active-line, rgba(0, 0, 0, 0.04))",
    },
    ".cm-selectionMatch": {
      backgroundColor: "var(--color-selection-match, rgba(82, 139, 255, 0.15))",
    },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "var(--color-bracket-match, rgba(82, 139, 255, 0.25))",
    },
    ".cm-gutters": {
      backgroundColor: "var(--color-gutter, transparent)",
      color: "var(--color-gutter-text, #999)",
      border: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--color-active-line, rgba(0, 0, 0, 0.04))",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "var(--color-fold, transparent)",
      border: "none",
      color: "var(--color-fold-text, #ddd)",
    },
    ".cm-tooltip": {
      border: "1px solid var(--color-border, #ddd)",
      backgroundColor: "var(--color-surface, #fff)",
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "var(--color-border, transparent)",
      borderBottomColor: "var(--color-border, transparent)",
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: "var(--color-surface, transparent)",
      borderBottomColor: "var(--color-surface, transparent)",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: "var(--color-primary, #528bff)",
        color: "var(--color-primary-text, #fff)",
      },
    },
  }, {dark})

  return theme
}

/// Syntax highlighting style using DuskMoonUI CSS custom properties.
export function duskMoonHighlightStyle(): Extension {
  const highlightStyle = HighlightStyle.define([
    {tag: tags.keyword, color: "var(--syntax-keyword, #c678dd)"},
    {tag: [tags.name, tags.deleted, tags.character, tags.propertyName, tags.macroName],
     color: "var(--syntax-name, #e06c75)"},
    {tag: [tags.function(tags.variableName), tags.labelName],
     color: "var(--syntax-function, #61afef)"},
    {tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
     color: "var(--syntax-constant, #d19a66)"},
    {tag: [tags.definition(tags.name), tags.separator],
     color: "var(--syntax-definition, #abb2bf)"},
    {tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace],
     color: "var(--syntax-type, #e5c07b)"},
    {tag: [tags.operator, tags.operatorKeyword, tags.url, tags.escape, tags.regexp, tags.link, tags.special(tags.string)],
     color: "var(--syntax-operator, #56b6c2)"},
    {tag: [tags.meta, tags.comment],
     color: "var(--syntax-comment, #5c6370)"},
    {tag: tags.strong, fontWeight: "bold"},
    {tag: tags.emphasis, fontStyle: "italic"},
    {tag: tags.strikethrough, textDecoration: "line-through"},
    {tag: tags.link, color: "var(--syntax-link, #56b6c2)", textDecoration: "underline"},
    {tag: tags.heading, fontWeight: "bold", color: "var(--syntax-heading, #e06c75)"},
    {tag: [tags.atom, tags.bool, tags.special(tags.variableName)],
     color: "var(--syntax-atom, #d19a66)"},
    {tag: [tags.processingInstruction, tags.string, tags.inserted],
     color: "var(--syntax-string, #98c379)"},
    {tag: tags.invalid, color: "var(--syntax-invalid, #ffffff)", backgroundColor: "var(--syntax-invalid-bg, #e06c75)"},
  ])

  return syntaxHighlighting(highlightStyle)
}

/// Combined DuskMoonUI editor theme + highlight style.
export function duskMoon(options: {dark?: boolean} = {}): Extension {
  return [duskMoonTheme(options), duskMoonHighlightStyle()]
}
