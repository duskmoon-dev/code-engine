// Vendored stub for @marijn/find-cluster-break
// [DUSKMOON] Vendored to eliminate external dependency
//
// Finds the next grapheme cluster break in a string. Handles surrogate
// pairs, extending characters, zero-width joiners, and flag emoji.

export function findClusterBreak(str: string, pos: number, forward = true, includeExtending = true): number {
  let len = str.length
  if (forward) {
    if (pos >= len) return pos
    let code = str.charCodeAt(pos)
    // Surrogate pair
    if (code >= 0xD800 && code < 0xDC00 && pos + 1 < len) {
      let next = str.charCodeAt(pos + 1)
      if (next >= 0xDC00 && next < 0xE000) pos += 2
      else pos++
    } else {
      pos++
    }
    if (includeExtending) {
      while (pos < len) {
        let code = str.charCodeAt(pos)
        // Zero-width joiner
        if (code == 0x200D) {
          pos++
          if (pos < len) {
            let next = str.charCodeAt(pos)
            if (next >= 0xD800 && next < 0xDC00 && pos + 1 < len) pos += 2
            else pos++
          }
          continue
        }
        // Variation selectors and combining marks
        if (code >= 0xFE00 && code <= 0xFE0F || // Variation Selectors
            code >= 0x300 && code <= 0x36F ||     // Combining Diacritical Marks
            code >= 0x1AB0 && code <= 0x1AFF ||   // Combining Diacritical Marks Extended
            code >= 0x20D0 && code <= 0x20FF ||   // Combining Diacritical Marks for Symbols
            code >= 0xFE20 && code <= 0xFE2F ||   // Combining Half Marks
            code == 0xE0100 ||                     // Variation selector (astral range simplified)
            code >= 0xDC00 && code < 0xE000) {     // Low surrogate (extending)
          pos++
          continue
        }
        // Regional indicator (flag emoji) — U+1F1E6 to U+1F1FF
        if (code >= 0xD800 && code < 0xDC00) {
          let next = pos + 1 < len ? str.charCodeAt(pos + 1) : 0
          let cp = (code - 0xD800) * 0x400 + (next - 0xDC00) + 0x10000
          if (cp >= 0x1F3FB && cp <= 0x1F3FF) { pos += 2; continue } // Skin tone modifiers
          if (cp >= 0xE0020 && cp <= 0xE007F) { pos += 2; continue } // Tags
          if (cp == 0xE007F) { pos += 2; continue }                  // Cancel tag
        }
        break
      }
    }
    return pos
  } else {
    if (pos <= 0) return pos
    let code = str.charCodeAt(pos - 1)
    // Surrogate pair
    if (code >= 0xDC00 && code < 0xE000 && pos - 2 >= 0) {
      let prev = str.charCodeAt(pos - 2)
      if (prev >= 0xD800 && prev < 0xDC00) pos -= 2
      else pos--
    } else {
      pos--
    }
    if (includeExtending) {
      while (pos > 0) {
        let code = str.charCodeAt(pos - 1)
        if (code == 0x200D && pos - 1 > 0) {
          let before = str.charCodeAt(pos - 2)
          if (before >= 0xDC00 && before < 0xE000 && pos - 3 >= 0) pos -= 3
          else pos -= 2
          continue
        }
        if (code >= 0xFE00 && code <= 0xFE0F ||
            code >= 0x300 && code <= 0x36F ||
            code >= 0x1AB0 && code <= 0x1AFF ||
            code >= 0x20D0 && code <= 0x20FF ||
            code >= 0xFE20 && code <= 0xFE2F) {
          pos--
          continue
        }
        if (code >= 0xDC00 && code < 0xE000 && pos - 2 >= 0) {
          let prev = str.charCodeAt(pos - 2)
          if (prev >= 0xD800 && prev < 0xDC00) {
            let cp = (prev - 0xD800) * 0x400 + (code - 0xDC00) + 0x10000
            if (cp >= 0x1F3FB && cp <= 0x1F3FF || cp >= 0xE0020 && cp <= 0xE007F || cp == 0xE007F) {
              pos -= 2
              continue
            }
          }
        }
        break
      }
    }
    return pos
  }
}
