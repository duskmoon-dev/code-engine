import { describe, it, expect } from "bun:test";
import { cpp, cppLanguage } from "../../src/lang/cpp/index";
import { EditorState } from "../../src/core/state/index";

describe("C++ language pack", () => {
  it("exports cpp function", () => {
    expect(typeof cpp).toBe("function");
  });

  it("exports cppLanguage", () => {
    expect(cppLanguage).toBeDefined();
    expect(cppLanguage.name).toBe("cpp");
  });

  it("creates language support", () => {
    const support = cpp();
    expect(support).toBeDefined();
    expect(support.language).toBe(cppLanguage);
  });

  it("cpp() integrates with EditorState", () => {
    const state = EditorState.create({
      doc: `#include <iostream>\nint main() {\n    std::cout << "Hello!" << std::endl;\n    return 0;\n}`,
      extensions: [cpp()],
    });
    expect(state.doc.toString()).toContain("#include");
  });
});
