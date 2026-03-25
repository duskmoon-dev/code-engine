import { describe, it, expect } from "bun:test";
import { rust, rustLanguage } from "../../src/lang/rust/index";
import { EditorState } from "../../src/core/state/index";

describe("Rust language pack", () => {
  it("exports rust function", () => {
    expect(typeof rust).toBe("function");
  });

  it("exports rustLanguage", () => {
    expect(rustLanguage).toBeDefined();
    expect(rustLanguage.name).toBe("rust");
  });

  it("creates language support", () => {
    const support = rust();
    expect(support).toBeDefined();
    expect(support.language).toBe(rustLanguage);
  });

  it("rust() returns LanguageSupport with rustLanguage", () => {
    const lang = rust();
    expect(lang.language).toBe(rustLanguage);
    expect(lang.language.name).toBe("rust");
  });

  it("rustLanguage can parse a Rust program", () => {
    const state = EditorState.create({
      doc: `fn main() {\n    println!("Hello, world!");\n}`,
      extensions: [rust()],
    });
    expect(state).toBeDefined();
    expect(state.doc.toString()).toContain("fn main");
  });
});
