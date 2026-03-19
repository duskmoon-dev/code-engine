import {styleTags, tags as t} from "../../parser/highlight"

export const jsonHighlighting = styleTags({
  String: t.string,
  Number: t.number,
  "True False": t.bool,
  PropertyName: t.propertyName,
  Null: t.null,
  ", :": t.separator,
  "[ ]": t.squareBracket,
  "{ }": t.brace
})
