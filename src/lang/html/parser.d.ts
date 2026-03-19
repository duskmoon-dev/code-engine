import {LRParser} from "../../parser/lr"
import {Parser} from "../../parser/common"

export declare const parser: LRParser

export declare function configureNesting(tags?: readonly {
  tag: string,
  attrs?: (attrs: {[attr: string]: string}) => boolean,
  parser: Parser
}[], attributes?: readonly {
  name: string,
  tagName?: string,
  parser: Parser
}[]): import("../../parser/common").ParseWrapper
