import { describe, it, expect } from "bun:test";
import { basicSetup, minimalSetup } from "../src/setup";

describe("Setup extensions", () => {
  it("exports basicSetup", () => {
    expect(basicSetup).toBeDefined();
  });

  it("basicSetup is an array of extensions", () => {
    expect(Array.isArray(basicSetup)).toBe(true);
    expect((basicSetup as unknown[]).length).toBeGreaterThan(0);
  });

  it("exports minimalSetup", () => {
    expect(minimalSetup).toBeDefined();
  });

  it("minimalSetup is an array of extensions", () => {
    expect(Array.isArray(minimalSetup)).toBe(true);
    expect((minimalSetup as unknown[]).length).toBeGreaterThan(0);
  });

  it("minimalSetup has fewer entries than basicSetup", () => {
    expect((minimalSetup as unknown[]).length).toBeLessThan(
      (basicSetup as unknown[]).length,
    );
  });
});
