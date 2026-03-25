import { describe, it, expect } from "bun:test";
import {
  sql, SQLDialect, StandardSQL, MySQL, PostgreSQL, SQLite,
  MariaSQL, MSSQL, Cassandra, PLSQL,
  keywordCompletionSource, schemaCompletionSource,
  type SQLConfig
} from "../../src/lang/sql/index";
import { EditorState } from "../../src/core/state/index";
import { syntaxTree } from "../../src/core/language/index";

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

  it("creates language support with MySQL dialect", () => {
    const support = sql({ dialect: MySQL });
    expect(support).toBeDefined();
  });

  it("creates language support with PostgreSQL dialect", () => {
    const support = sql({ dialect: PostgreSQL });
    expect(support).toBeDefined();
  });

  it("creates language support with SQLite dialect", () => {
    const support = sql({ dialect: SQLite });
    expect(support).toBeDefined();
  });

  it("creates language support with schema config", () => {
    const config: SQLConfig = {
      dialect: StandardSQL,
      schema: {
        users: ["id", "name", "email"],
        orders: ["id", "user_id", "total"],
      },
      defaultTable: "users",
    };
    const support = sql(config);
    expect(support).toBeDefined();
  });

  it("keywordCompletionSource returns a function", () => {
    const source = keywordCompletionSource(StandardSQL);
    expect(typeof source).toBe("function");
  });

  it("keywordCompletionSource with upperCase=true", () => {
    const source = keywordCompletionSource(StandardSQL, true);
    expect(typeof source).toBe("function");
  });

  it("schemaCompletionSource returns a function", () => {
    const source = schemaCompletionSource({
      schema: { users: ["id", "name"] },
    });
    expect(typeof source).toBe("function");
  });

  it("SQLDialect instances are distinct", () => {
    expect(MySQL).not.toBe(PostgreSQL);
    expect(MySQL).not.toBe(SQLite);
    expect(PostgreSQL).not.toBe(SQLite);
  });

  it("StandardSQL language parser produces a non-empty tree", () => {
    const tree = StandardSQL.language.parser.parse("SELECT id, name FROM users WHERE id = 1;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("StandardSQL language parser tree has a top-level type", () => {
    const tree = StandardSQL.language.parser.parse("INSERT INTO t (a, b) VALUES (1, 2);");
    expect(tree.type.isTop).toBe(true);
  });

  it("syntaxTree from EditorState with sql() is non-empty", () => {
    const state = EditorState.create({
      doc: "SELECT * FROM users;",
      extensions: [sql()],
    });
    const tree = syntaxTree(state);
    expect(tree.length).toBeGreaterThan(0);
  });

  it("MySQL dialect parses MySQL-specific syntax", () => {
    const tree = MySQL.language.parser.parse("SELECT `name` FROM `users` LIMIT 10;");
    expect(tree.length).toBeGreaterThan(0);
  });
});
