import { describe, it, expect } from "bun:test";
import {
  sql, SQLDialect, StandardSQL, MySQL, PostgreSQL, SQLite,
  MariaSQL, MSSQL, Cassandra, PLSQL,
  keywordCompletionSource, schemaCompletionSource
} from "../../src/lang/sql/index";

describe("SQL language pack", () => {
  it("exports sql function", () => {
    expect(typeof sql).toBe("function");
  });

  it("exports SQLDialect", () => {
    expect(SQLDialect).toBeDefined();
  });

  it("exports standard dialect variants", () => {
    expect(StandardSQL).toBeDefined();
    expect(MySQL).toBeDefined();
    expect(PostgreSQL).toBeDefined();
    expect(SQLite).toBeDefined();
    expect(MariaSQL).toBeDefined();
    expect(MSSQL).toBeDefined();
    expect(Cassandra).toBeDefined();
    expect(PLSQL).toBeDefined();
  });

  it("exports keywordCompletionSource", () => {
    expect(typeof keywordCompletionSource).toBe("function");
  });

  it("exports schemaCompletionSource", () => {
    expect(typeof schemaCompletionSource).toBe("function");
  });

  it("creates language support with default options", () => {
    const support = sql();
    expect(support).toBeDefined();
  });
});
