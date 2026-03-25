import { describe, it, expect } from "bun:test";
import { java, javaLanguage } from "../../src/lang/java/index";
import { EditorState } from "../../src/core/state/index";

describe("Java language pack", () => {
  it("exports java function", () => {
    expect(typeof java).toBe("function");
  });

  it("exports javaLanguage", () => {
    expect(javaLanguage).toBeDefined();
    expect(javaLanguage.name).toBe("java");
  });

  it("creates language support", () => {
    const support = java();
    expect(support).toBeDefined();
    expect(support.language).toBe(javaLanguage);
  });

  it("java() integrates with EditorState", () => {
    const state = EditorState.create({
      doc: `public class Hello {\n    public static void main(String[] args) {\n        System.out.println("Hello!");\n    }\n}`,
      extensions: [java()],
    });
    expect(state.doc.toString()).toContain("public class Hello");
  });
});
