// [DUSKMOON] Vendored from @replit/codemirror-emacs v6.1.0
// MIT License — Copyright (C) 2018-2021 by Marijn Haverbeke <marijnh@gmail.com> and others
// [DUSKMOON] Rewritten imports to use vendored CodeMirror modules

import {Prec} from "../../core/state"
import * as View from "../../core/view"
import {EditorView, Direction} from "../../core/view"
import type {ViewUpdate} from "../../core/view"
import type {SelectionRange} from "../../core/state"
import type {EmacsHandler} from "./emacs"

// backwards compatibility for old versions not supporting getDrawSelectionConfig
// [DUSKMOON] Use vendored getDrawSelectionConfig
let getDrawSelectionConfig = (View as any).getDrawSelectionConfig || function () {
  let defaultConfig = {cursorBlinkRate: 1200}
  return function () {
    return defaultConfig
  }
}()

class Piece {
  constructor(
    public left: number,
    public top: number,
    public height: number,
    public fontFamily: string,
    public fontSize: string,
    public fontWeight: string,
    public color: string,
    public className: string,
    public letter: string,
    public partial: boolean,
  ) {}

  draw() {
    let elt = document.createElement("div")
    elt.className = this.className
    this.adjust(elt)
    return elt
  }

  adjust(elt: HTMLElement) {
    elt.style.left = this.left + "px"
    elt.style.top = this.top + "px"
    elt.style.height = this.height + "px"
    elt.style.lineHeight = this.height + "px"
    elt.style.fontFamily = this.fontFamily
    elt.style.fontSize = this.fontSize
    elt.style.fontWeight = this.fontWeight
    elt.style.color = this.partial ? "transparent" : this.color
    elt.className = this.className
    elt.textContent = this.letter
  }

  eq(p: Piece) {
    return this.left == p.left && this.top == p.top && this.height == p.height &&
      this.fontFamily == p.fontFamily && this.fontSize == p.fontSize &&
      this.fontWeight == p.fontWeight && this.color == p.color &&
      this.className == p.className &&
      this.letter == p.letter
  }
}

function configChanged(update: ViewUpdate) {
  return getDrawSelectionConfig(update.startState) != getDrawSelectionConfig(update.state)
}

function getBase(view: EditorView) {
  let rect = view.scrollDOM.getBoundingClientRect()
  let left = view.textDirection == Direction.LTR ? rect.left : rect.right - view.scrollDOM.clientWidth
  return {left: left - view.scrollDOM.scrollLeft, top: rect.top - view.scrollDOM.scrollTop}
}

function measureCursor(em: EmacsHandler, view: EditorView, cursor: SelectionRange, primary: boolean) {
  let head = cursor.head
  let hCoeff = 1

  if (em.$data.count || em.$data.keyChain) {
    hCoeff = 0.5
  }

  {
    let letter: string | false = head < view.state.doc.length && view.state.sliceDoc(head, head + 1)
    if (letter && (/[\uDC00-\uDFFF]/.test(letter) && head > 1)) {
      // step back if cursor is on the second half of a surrogate pair
      head--
      letter = view.state.sliceDoc(head, head + 1)
    }

    let pos = view.coordsAtPos(head, 1)
    if (!pos) return null
    let base = getBase(view)
    let domAtPos: {node: Node; offset: number} | null = view.domAtPos(head)
    let node: Node = domAtPos ? domAtPos.node : view.contentDOM
    while (domAtPos && domAtPos.node instanceof HTMLElement) {
      node = domAtPos.node
      domAtPos = {node: domAtPos.node.childNodes[domAtPos.offset], offset: 0}
    }
    if (!(node instanceof HTMLElement)) {
      if (!node.parentNode) return null
      node = node.parentNode
    }

    let style = getComputedStyle(node as HTMLElement)
    let left = pos.left

    // TODO remove coordsAtPos when all supported versions of codemirror have coordsForChar api
    let charCoords = (view as any).coordsForChar?.(head)
    if (charCoords) {
      left = charCoords.left
    }

    if (!letter || letter == "\n" || letter == "\r") {
      letter = "\xa0"
    } else if (letter == "\t") {
      letter = "\xa0"
      var nextPos = view.coordsAtPos(head + 1, -1)
      if (nextPos) {
        left = nextPos.left - (nextPos.left - pos.left) / parseInt(style.tabSize)
      }
    } else if (/[\uD800-\uDBFF]/.test(letter) && head < view.state.doc.length - 1) {
      // include the second half of a surrogate pair in cursor
      letter += view.state.sliceDoc(head + 1, head + 2)
    }

    let h = pos.bottom - pos.top
    return new Piece(
      left - base.left,
      pos.top - base.top + h * (1 - hCoeff),
      h * hCoeff,
      style.fontFamily,
      style.fontSize,
      style.fontWeight,
      style.color,
      primary ? "cm-fat-cursor cm-cursor-primary" : "cm-fat-cursor cm-cursor-secondary",
      letter || "\xa0",
      hCoeff != 1,
    )
  }
}

export class BlockCursorPlugin {
  rangePieces: Piece[] = []
  cursors: Piece[] = []
  measureReq: {read: () => {cursors: Piece[]}; write: (value: {cursors: Piece[]}) => void}
  cursorLayer: HTMLDivElement

  constructor(public view: EditorView, public em: EmacsHandler) {
    this.measureReq = {read: this.readPos.bind(this), write: this.drawSel.bind(this)}
    this.cursorLayer = view.scrollDOM.appendChild(document.createElement("div"))
    this.cursorLayer.className = "cm-cursorLayer cm-vimCursorLayer"
    this.cursorLayer.setAttribute("aria-hidden", "true")
    view.requestMeasure(this.measureReq)
    this.setBlinkRate()
  }

  setBlinkRate() {
    let config = getDrawSelectionConfig(this.view.state)
    let blinkRate = config.cursorBlinkRate
    this.cursorLayer.style.animationDuration = blinkRate + "ms"
  }

  update(update: ViewUpdate) {
    if (update.selectionSet || update.geometryChanged || update.viewportChanged) {
      this.view.requestMeasure(this.measureReq)
      this.cursorLayer.style.animationName =
        this.cursorLayer.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink"
    }
    if (configChanged(update)) this.setBlinkRate()
  }

  scheduleRedraw() {
    this.view.requestMeasure(this.measureReq)
  }

  readPos() {
    let {state} = this.view
    let cursors: Piece[] = []
    for (let r of state.selection.ranges) {
      let prim = r == state.selection.main
      let piece = measureCursor(this.em, this.view, r, prim)
      if (piece) cursors.push(piece)
    }
    return {cursors}
  }

  drawSel({cursors}: {cursors: Piece[]}) {
    if (cursors.length != this.cursors.length || cursors.some((c, i) => !c.eq(this.cursors[i]))) {
      let oldCursors = this.cursorLayer.children
      if (oldCursors.length !== cursors.length) {
        this.cursorLayer.textContent = ""
        for (const c of cursors) this.cursorLayer.appendChild(c.draw())
      } else {
        cursors.forEach((c, idx) => c.adjust(oldCursors[idx] as HTMLElement))
      }
      this.cursors = cursors
    }
  }

  destroy() {
    this.cursorLayer.remove()
  }
}

export const themeSpec = {
  ".cm-line": {
    "& ::selection": {backgroundColor: "transparent !important"},
    "&::selection": {backgroundColor: "transparent !important"},
    caretColor: "transparent !important",
  },
  ".cm-fat-cursor": {
    position: "absolute",
    background: "#ff9696",
    border: "none",
    whiteSpace: "pre",
  },
  "&:not(.cm-focused) .cm-fat-cursor": {
    background: "none",
    outline: "solid 1px #ff9696",
    color: "transparent !important",
  },
}

export const hideNativeSelection = Prec.highest(EditorView.theme(themeSpec))
