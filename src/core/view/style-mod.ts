// Vendored from marijnh/style-mod — MIT License
// [DUSKMOON] Vendored to eliminate external dependency

export type StyleSpec = {
  [propOrSelector: string]: string | number | StyleSpec | null
}

const C = "\u037c"
const COUNT: symbol | string = typeof Symbol == "undefined" ? "__" + C : Symbol.for(C)
const SET: symbol | string = typeof Symbol == "undefined" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet")
const top: any = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : {}

export class StyleModule {
  rules: string[]

  constructor(spec: {[selector: string]: StyleSpec}, options?: {finish?(sel: string): string}) {
    this.rules = []
    let {finish} = options || {} as {finish?: (sel: string) => string}

    function splitSelector(selector: string): string[] {
      return /^@/.test(selector) ? [selector] : selector.split(/,\s*/)
    }

    function render(selectors: string[], spec: any, target: string[], isKeyframes?: boolean) {
      let local: string[] = [], isAt = /^@(\w+)\b/.exec(selectors[0]), keyframes = isAt && isAt[1] == "keyframes"
      if (isAt && spec == null) return target.push(selectors[0] + ";")
      for (let prop in spec) {
        let value = spec[prop]
        if (/&/.test(prop)) {
          render(prop.split(/,\s*/).map(part => selectors.map(sel => part.replace(/&/, sel))).reduce((a, b) => a.concat(b)),
                 value, target)
        } else if (value && typeof value == "object") {
          if (!isAt) throw new RangeError("The value of a property (" + prop + ") should be a primitive value.")
          render(splitSelector(prop), value, local, keyframes as boolean)
        } else if (value != null) {
          local.push(prop.replace(/_.*/, "").replace(/[A-Z]/g, l => "-" + l.toLowerCase()) + ": " + value + ";")
        }
      }
      if (local.length || keyframes) {
        target.push((finish && !isAt && !isKeyframes ? selectors.map(finish) : selectors).join(", ") +
                    " {" + local.join(" ") + "}")
      }
    }

    for (let prop in spec) render(splitSelector(prop), (spec as any)[prop], this.rules)
  }

  getRules(): string { return this.rules.join("\n") }

  static newName(): string {
    let id = top[COUNT] || 1
    top[COUNT] = id + 1
    return C + id.toString(36)
  }

  static mount(
    root: Document | ShadowRoot | DocumentOrShadowRoot,
    modules: StyleModule | ReadonlyArray<StyleModule>,
    options?: {nonce?: string}
  ): void {
    let set = (root as any)[SET] as StyleSet | undefined, nonce = options && options.nonce
    if (!set) set = new StyleSet(root, nonce)
    else if (nonce) set.setNonce(nonce)
    set.mount(Array.isArray(modules) ? modules : [modules], root)
  }
}

let adoptedSet = new Map<Document, StyleSet>()

class StyleSet {
  sheet: CSSStyleSheet | null = null
  styleTag: HTMLStyleElement | null = null
  modules: StyleModule[] = []

  constructor(root: any, nonce?: string) {
    let doc = root.ownerDocument || root, win = doc.defaultView
    if (!root.head && root.adoptedStyleSheets && win.CSSStyleSheet) {
      let adopted = adoptedSet.get(doc)
      if (adopted) { (root as any)[SET] = adopted; return }
      this.sheet = new win.CSSStyleSheet()
      adoptedSet.set(doc, this)
    } else {
      this.styleTag = doc.createElement("style")
      if (nonce) this.styleTag!.setAttribute("nonce", nonce)
    }
    this.modules = [];
    (root as any)[SET] = this
  }

  mount(modules: StyleModule[], root: any) {
    let sheet = this.sheet
    let pos = 0, j = 0
    for (let i = 0; i < modules.length; i++) {
      let mod = modules[i], index = this.modules.indexOf(mod)
      if (index < j && index > -1) {
        this.modules.splice(index, 1)
        j--
        index = -1
      }
      if (index == -1) {
        this.modules.splice(j++, 0, mod)
        if (sheet) for (let k = 0; k < mod.rules.length; k++)
          sheet.insertRule(mod.rules[k], pos++)
      } else {
        while (j < index) pos += this.modules[j++].rules.length
        pos += mod.rules.length
        j++
      }
    }

    if (sheet) {
      if (root.adoptedStyleSheets.indexOf(this.sheet) < 0)
        root.adoptedStyleSheets = [this.sheet, ...root.adoptedStyleSheets]
    } else {
      let text = ""
      for (let i = 0; i < this.modules.length; i++)
        text += this.modules[i].getRules() + "\n"
      this.styleTag!.textContent = text
      let target = root.head || root
      if (this.styleTag!.parentNode != target)
        target.insertBefore(this.styleTag, target.firstChild)
    }
  }

  setNonce(nonce: string) {
    if (this.styleTag && this.styleTag.getAttribute("nonce") != nonce)
      this.styleTag.setAttribute("nonce", nonce)
  }
}
