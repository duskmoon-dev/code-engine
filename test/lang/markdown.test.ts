import { describe, it, expect } from "bun:test";
import {
  markdown,
  markdownLanguage,
  parser,
  parseCode,
  GFM,
  Table,
  TaskList,
  Strikethrough,
  Autolink,
  Subscript,
  Superscript,
  Emoji,
} from "../../src/lang/markdown/index";

describe("Markdown language pack", () => {
  it("exports markdown function", () => {
    expect(typeof markdown).toBe("function");
  });

  it("exports markdownLanguage", () => {
    expect(markdownLanguage).toBeDefined();
    expect(markdownLanguage.name).toBe("markdown");
  });

  it("creates language support with default options", () => {
    const support = markdown();
    expect(support).toBeDefined();
  });

  it("exports parser", () => {
    expect(parser).toBeDefined();
  });

  it("exports parseCode function", () => {
    expect(typeof parseCode).toBe("function");
  });

  it("exports GFM extension", () => {
    expect(GFM).toBeDefined();
  });

  it("exports Table extension", () => {
    expect(Table).toBeDefined();
  });

  it("exports TaskList extension", () => {
    expect(TaskList).toBeDefined();
  });

  it("exports Strikethrough extension", () => {
    expect(Strikethrough).toBeDefined();
  });

  it("exports Autolink extension", () => {
    expect(Autolink).toBeDefined();
  });

  it("exports Subscript extension", () => {
    expect(Subscript).toBeDefined();
  });

  it("exports Superscript extension", () => {
    expect(Superscript).toBeDefined();
  });

  it("exports Emoji extension", () => {
    expect(Emoji).toBeDefined();
  });
});
