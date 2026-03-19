import { describe, it, expect } from "bun:test";
import { rust, rustLanguage } from "../../src/lang/rust/index";

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
  });
});
