// Vendored version of crelt (https://github.com/marijnh/crelt)
// A minimal DOM element creation utility.
// Original license: MIT, by Marijn Haverbeke

type Child = string | Node | null | undefined | false | readonly Child[]
type Attrs = {[key: string]: any}

function crelt(elt: string, ...children: Child[]): HTMLElement
function crelt(elt: string, attrs: Attrs, ...children: Child[]): HTMLElement
function crelt(elt: string, ...args: any[]): HTMLElement {
  let node = document.createElement(elt)
  let firstChild = 0
  if (args.length && typeof args[0] == "object" && args[0] !== null &&
      !Array.isArray(args[0]) && !(args[0] instanceof Node)) {
    let attrs = args[0] as Attrs
    firstChild = 1
    for (let name in attrs) {
      let val = attrs[name]
      if (typeof val == "string") node.setAttribute(name, val)
      else if (val != null) (node as any)[name] = val
    }
  }
  for (let i = firstChild; i < args.length; i++) add(node, args[i])
  return node
}

function add(node: HTMLElement, child: Child) {
  if (typeof child == "string") {
    node.appendChild(document.createTextNode(child))
  } else if (child instanceof Node) {
    node.appendChild(child)
  } else if (Array.isArray(child)) {
    for (let i = 0; i < child.length; i++) add(node, child[i])
  }
  // null, undefined, false are silently ignored
}

export default crelt
