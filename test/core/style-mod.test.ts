import { describe, it, expect } from "bun:test";
import { StyleModule } from "../../src/core/view/style-mod";

// Minimal DOM doubles keep stylesheet mounting tests independent of a browser.
class TestStyleSheet {
  rules: string[] = [];

  insertRule(rule: string, index: number) {
    this.rules.splice(index, 0, rule);
  }
}

function shadowRoot(ownerDocument: object, adoptedStyleSheets: TestStyleSheet[] = []) {
  return { ownerDocument, adoptedStyleSheets } as unknown as ShadowRoot;
}

function rules(root: ShadowRoot) {
  return (root.adoptedStyleSheets[0] as unknown as TestStyleSheet).rules;
}

describe("StyleModule.mount", () => {
  it("reuses an adopted stylesheet across ShadowRoots without duplicating rules", () => {
    const doc = { defaultView: { CSSStyleSheet: TestStyleSheet } };
    const first = shadowRoot(doc);
    const existing = new TestStyleSheet();
    const second = shadowRoot(doc, [existing]);
    const base = new StyleModule({ ".cm-editor": { color: "red" } });

    StyleModule.mount(first, base);
    StyleModule.mount(second, base);
    StyleModule.mount(second, base);

    expect(second.adoptedStyleSheets).toEqual([first.adoptedStyleSheets[0], existing]);
    expect(second.adoptedStyleSheets[0]).toBe(first.adoptedStyleSheets[0]);
    expect(rules(first)).toEqual(base.rules);
  });

  it("mounts additional modules through the reused stylesheet", () => {
    const doc = { defaultView: { CSSStyleSheet: TestStyleSheet } };
    const first = shadowRoot(doc);
    const second = shadowRoot(doc);
    const base = new StyleModule({ ".cm-editor": { color: "red" } });
    const extra = new StyleModule({ ".cm-content": { color: "blue" } });
    const later = new StyleModule({ ".cm-gutters": { color: "green" } });

    StyleModule.mount(first, base);
    StyleModule.mount(second, [base, extra]);
    StyleModule.mount(second, [base, extra, later]);
    StyleModule.mount(first, [base, extra, later]);

    expect(second.adoptedStyleSheets[0]).toBe(first.adoptedStyleSheets[0]);
    expect(rules(second)).toEqual([...base.rules, ...extra.rules, ...later.rules]);
  });

  it("keeps adopted stylesheets separate for different Documents", () => {
    const first = shadowRoot({ defaultView: { CSSStyleSheet: TestStyleSheet } });
    const second = shadowRoot({ defaultView: { CSSStyleSheet: TestStyleSheet } });
    const base = new StyleModule({ ".cm-editor": { color: "red" } });

    StyleModule.mount(first, base);
    StyleModule.mount(second, base);

    expect(second.adoptedStyleSheets[0]).not.toBe(first.adoptedStyleSheets[0]);
    expect(rules(first)).toEqual(base.rules);
    expect(rules(second)).toEqual(base.rules);
  });

  it.each(["Document", "ShadowRoot"])("uses a style tag for a %s without adopted stylesheet support", (kind) => {
    const attributes = new Map<string, string>();
    const styleTag = {
      textContent: "",
      parentNode: null as unknown,
      setAttribute(name: string, value: string) { attributes.set(name, value); },
      getAttribute(name: string) { return attributes.get(name) ?? null; },
    };
    const target = {
      firstChild: null,
      children: [] as typeof styleTag[],
      insertBefore(tag: typeof styleTag, before: null) {
        expect(before).toBe(this.firstChild);
        this.children.push(tag);
        tag.parentNode = this;
      },
    };
    const doc = {
      defaultView: {},
      head: target,
      createElement(name: string) {
        expect(name).toBe("style");
        return styleTag;
      },
    };
    const root = (kind === "Document" ? doc : { ...target, ownerDocument: doc }) as unknown as Document | ShadowRoot;
    const base = new StyleModule({ ".cm-editor": { color: "red" } });
    const extra = new StyleModule({ ".cm-content": { color: "blue" } });

    StyleModule.mount(root, base, { nonce: "first" });
    expect(styleTag.getAttribute("nonce")).toBe("first");
    StyleModule.mount(root, [base, extra], { nonce: "updated" });

    expect(target.children).toEqual([styleTag]);
    expect(styleTag.parentNode).toBe(kind === "Document" ? target : root);
    expect(styleTag.textContent).toBe(base.getRules() + "\n" + extra.getRules() + "\n");
    expect(styleTag.getAttribute("nonce")).toBe("updated");
  });
});
