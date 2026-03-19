// Vendored minimal stub for the `marked` library
// [DUSKMOON] Vendored to eliminate external dependency

interface MarkedToken {
  type: string
  lang: string
  text: string
  escaped: boolean
  [key: string]: any
}

interface MarkedOptions {
  walkTokens?: (token: MarkedToken) => void
}

interface ParseOptions {
  async?: boolean
  [key: string]: any
}

export class Marked {
  private options: MarkedOptions

  constructor(options: MarkedOptions = {}) {
    this.options = options
  }

  parse(src: string, options?: ParseOptions): string {
    // Minimal markdown-to-HTML conversion
    let html = src

    // Walk tokens if configured (for syntax highlighting)
    if (this.options.walkTokens) {
      const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
      let match: RegExpExecArray | null
      while ((match = codeBlockRegex.exec(src)) !== null) {
        const token: MarkedToken = {
          type: "code",
          lang: match[1],
          text: match[2],
          escaped: false
        }
        this.options.walkTokens(token)
        if (token.escaped) {
          html = html.replace(match[0], `<pre><code class="language-${token.lang}">${token.text}</code></pre>`)
        }
      }
    }

    // Basic markdown conversions
    html = html
      // Code blocks (remaining)
      .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) =>
        `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`)
      // Inline code
      .replace(/`([^`]+)`/g, (_m, code) => `<code>${escapeHtml(code)}</code>`)
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')

    return html
  }
}

function escapeHtml(text: string): string {
  return text.replace(/[<&"]/g, ch =>
    ch === '<' ? '&lt;' : ch === '&' ? '&amp;' : '&quot;')
}
