import { describe, it, expect } from "bun:test";
import {
  collab,
  receiveUpdates,
  sendableUpdates,
  getSyncedVersion,
  getClientID,
  rebaseUpdates,
} from "../../src/core/collab/index";

describe("Collab extension", () => {
  it("exports collab function", () => {
    expect(typeof collab).toBe("function");
  });

  it("exports receiveUpdates function", () => {
    expect(typeof receiveUpdates).toBe("function");
  });

  it("exports sendableUpdates function", () => {
    expect(typeof sendableUpdates).toBe("function");
  });

  it("exports getSyncedVersion function", () => {
    expect(typeof getSyncedVersion).toBe("function");
  });

  it("exports getClientID function", () => {
    expect(typeof getClientID).toBe("function");
  });

  it("exports rebaseUpdates function", () => {
    expect(typeof rebaseUpdates).toBe("function");
  });

  it("collab returns an extension with default config", () => {
    const ext = collab();
    expect(ext).toBeDefined();
    expect(Array.isArray(ext)).toBe(true);
  });

  it("collab accepts a config object", () => {
    const ext = collab({ startVersion: 5, clientID: "test-client" });
    expect(ext).toBeDefined();
    expect(Array.isArray(ext)).toBe(true);
  });

  it("rebaseUpdates returns empty array for empty inputs", () => {
    const result = rebaseUpdates([], []);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
