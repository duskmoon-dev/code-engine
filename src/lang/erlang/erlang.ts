import {StreamLanguage, LanguageSupport} from "../../core/language"
import {erlang as erlangStream} from "../legacy/erlang"

/// Erlang language definition using the legacy CodeMirror stream parser.
export const erlangLanguage = StreamLanguage.define(erlangStream)

/// Erlang language support.
export function erlang() {
  return new LanguageSupport(erlangLanguage)
}
