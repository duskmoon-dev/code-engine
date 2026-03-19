import { CompletionSource } from '../../core/autocomplete';
import { LRLanguage, LanguageSupport } from '../../core/language';

/**
A language provider for Less style sheets.
*/
declare const lessLanguage: LRLanguage;
/**
Property, variable, @-variable, and value keyword completion
source.
*/
declare const lessCompletionSource: CompletionSource;
/**
Language support for Less.
*/
declare function less(): LanguageSupport;

export { less, lessCompletionSource, lessLanguage };
