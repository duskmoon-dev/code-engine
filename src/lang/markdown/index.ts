export {parser, MarkdownParser, MarkdownConfig, MarkdownExtension,
        NodeSpec, InlineParser, BlockParser, LeafBlockParser,
        Line, Element, LeafBlock, DelimiterType, BlockContext, InlineContext} from "./markdown"
export {parseCode} from "./nest"
export {Table, TaskList, Strikethrough, Autolink, GFM, Subscript, Superscript, Emoji} from "./extension"

import {parser} from "./markdown"
import {Language, defineLanguageFacet, LanguageSupport} from "../../core/language"

/// A [`Language`](#language.Language) instance for Markdown.
export const markdownLanguage = new Language(defineLanguageFacet({commentTokens: {block: {open: "<!--", close: "-->"}}}), parser, [], "markdown")

/// Returns a [`LanguageSupport`](#language.LanguageSupport) instance for Markdown.
export function markdown(): LanguageSupport {
  return new LanguageSupport(markdownLanguage)
}
