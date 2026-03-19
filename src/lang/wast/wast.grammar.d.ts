import { LRLanguage, LanguageSupport } from '../../core/language';

declare const wastLanguage: LRLanguage;
declare function wast(): LanguageSupport;

export { wast, wastLanguage };
