// Vendored type stubs for w3c-keyname
// [DUSKMOON] Vendored to eliminate external dependency

const base: Record<number, string> = {
  8: "Backspace", 9: "Tab", 10: "Enter", 12: "NumLock", 13: "Enter", 16: "Shift", 17: "Control", 18: "Alt",
  20: "CapsLock", 27: "Escape", 32: " ", 33: "PageUp", 34: "PageDown", 35: "End", 36: "Home",
  37: "ArrowLeft", 38: "ArrowUp", 39: "ArrowRight", 40: "ArrowDown", 44: "PrintScreen",
  45: "Insert", 46: "Delete", 59: ";", 61: "=", 91: "Meta", 92: "Meta", 106: "*", 107: "+",
  108: ",", 109: "-", 110: ".", 111: "/", 144: "NumLock", 145: "ScrollLock", 160: "Shift",
  161: "Shift", 162: "Control", 163: "Control", 164: "Alt", 165: "Alt", 173: "-",
  186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[",
  220: "\\", 221: "]", 222: "'"
}

const shift: Record<number, string> = {
  48: ")", 49: "!", 50: "@", 51: "#", 52: "$", 53: "%", 54: "^", 55: "&", 56: "*", 57: "(",
  59: ":", 61: "+", 173: "_", 186: ":", 187: "+", 188: "<", 189: "_", 190: ">", 191: "?",
  192: "~", 219: "{", 220: "|", 221: "}", 222: "\""
}

for (let i = 0; i < 10; i++) base[48 + i] = String(i)
for (let i = 1; i <= 24; i++) base[i + 111] = "F" + i
for (let i = 65; i <= 90; i++) {
  base[i] = String.fromCharCode(i + 32)
  shift[i] = String.fromCharCode(i)
}

function keyName(event: KeyboardEvent): string {
  let ignoreKey = (/Mac/.test(navigator.platform) ? event.metaKey : event.ctrlKey) && !event.altKey
  let name: string | undefined
  if (event.key && event.key != "Unidentified") {
    name = event.key
    if (name == "Esc") name = "Escape"
    if (name == "Del") name = "Delete"
    if (name == "Left") name = "ArrowLeft"
    if (name == "Up") name = "ArrowUp"
    if (name == "Right") name = "ArrowRight"
    if (name == "Down") name = "ArrowDown"
  }
  if (!name) {
    name = base[event.keyCode]
    if (!name) return "Unidentified"
  }
  if (ignoreKey && name.length == 1 && name != " " && event.shiftKey) {
    let shifted = shift[event.keyCode]
    if (shifted) name = shifted
  }
  return name
}

export { base, shift, keyName }
