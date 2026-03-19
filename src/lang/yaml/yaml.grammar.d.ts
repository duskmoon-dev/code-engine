import { LRLanguage, LanguageSupport, Language } from "../../core/language"

declare const yamlLanguage: LRLanguage
declare function yaml(): LanguageSupport
declare function yamlFrontmatter(config: { content: Language | LanguageSupport }): LanguageSupport

export { yaml, yamlFrontmatter, yamlLanguage }
