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

  it("sql parse tree cursor traversal works", () => {
    const tree = StandardSQL.language.parser.parse("SELECT id, name FROM users WHERE id = 1;");
    const cursor = tree.cursor();
    let nodeCount = 0;
    do { nodeCount++; } while (cursor.next() && nodeCount < 100);
    expect(nodeCount).toBeGreaterThan(1);
  });

  it("PostgreSQL dialect is defined", () => {
    expect(PostgreSQL).toBeDefined();
    expect(PostgreSQL.language).toBeDefined();
  });

  it("SQLite dialect is defined", () => {
    expect(SQLite).toBeDefined();
    expect(SQLite.language).toBeDefined();
  });

  it("MSSQL dialect is defined", () => {
    expect(MSSQL).toBeDefined();
    expect(MSSQL.language).toBeDefined();
  });

  it("StandardSQL can parse JOIN queries", () => {
    const tree = StandardSQL.language.parser.parse("SELECT u.name, o.total FROM users u INNER JOIN orders o ON u.id = o.user_id;");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("StandardSQL can parse subqueries", () => {
    const tree = StandardSQL.language.parser.parse("SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE total > 100);");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("StandardSQL can parse CREATE TABLE", () => {
    const tree = StandardSQL.language.parser.parse("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE);");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("StandardSQL can parse INSERT", () => {
    const tree = StandardSQL.language.parser.parse("INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("StandardSQL can parse UPDATE", () => {
    const tree = StandardSQL.language.parser.parse("UPDATE users SET email = 'new@example.com' WHERE id = 1;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("StandardSQL can parse DELETE", () => {
    const tree = StandardSQL.language.parser.parse("DELETE FROM users WHERE id = 1;");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("tree.resolve() finds nodes in SQL code", () => {
    const code = "SELECT id, name FROM users WHERE active = 1;";
    const tree = StandardSQL.language.parser.parse(code);
    for (let i = 0; i < code.length; i += 6) {
      const node = tree.resolve(i);
      expect(node).toBeDefined();
    }
  });

  it("StandardSQL can parse GROUP BY and HAVING", () => {
    const tree = StandardSQL.language.parser.parse("SELECT dept, COUNT(*) FROM employees GROUP BY dept HAVING COUNT(*) > 5;");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("StandardSQL can parse ORDER BY with multiple columns", () => {
    const tree = StandardSQL.language.parser.parse("SELECT * FROM users ORDER BY last_name ASC, first_name DESC;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("StandardSQL can parse window functions", () => {
    const tree = StandardSQL.language.parser.parse("SELECT name, salary, RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rank FROM employees;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("StandardSQL can parse CTEs (WITH clause)", () => {
    const tree = StandardSQL.language.parser.parse("WITH active_users AS (SELECT * FROM users WHERE active = 1) SELECT * FROM active_users;");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("StandardSQL can parse CASE expressions", () => {
    const tree = StandardSQL.language.parser.parse("SELECT name, CASE WHEN score > 90 THEN 'A' WHEN score > 80 THEN 'B' ELSE 'C' END AS grade FROM students;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("StandardSQL can parse aggregate functions", () => {
    const tree = StandardSQL.language.parser.parse("SELECT COUNT(*), SUM(salary), AVG(salary), MIN(salary), MAX(salary) FROM employees;");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("StandardSQL can parse UNION queries", () => {
    const tree = StandardSQL.language.parser.parse("SELECT name FROM customers UNION SELECT name FROM employees;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("StandardSQL can parse CREATE INDEX", () => {
    const tree = StandardSQL.language.parser.parse("CREATE INDEX idx_users_email ON users (email);");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("StandardSQL can parse DROP TABLE", () => {
    const tree = StandardSQL.language.parser.parse("DROP TABLE IF EXISTS temp_data;");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("StandardSQL can parse ALTER TABLE", () => {
    const tree = StandardSQL.language.parser.parse("ALTER TABLE users ADD COLUMN phone TEXT;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("SQLite dialect parses SQLite-specific syntax", () => {
    const tree = SQLite.language.parser.parse("SELECT * FROM sqlite_master WHERE type='table';");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("MSSQL dialect parses T-SQL syntax", () => {
    const tree = MSSQL.language.parser.parse("SELECT TOP 10 * FROM users;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("PostgreSQL dialect is defined and has a language", () => {
    expect(PostgreSQL.language).toBeDefined();
    const tree = PostgreSQL.language.parser.parse("SELECT * FROM users LIMIT 10 OFFSET 5;");
    expect(tree.length).toBeGreaterThan(0);
  });

  it("StandardSQL can parse LEFT and RIGHT joins", () => {
    const tree = StandardSQL.language.parser.parse("SELECT u.name, o.total FROM users u LEFT JOIN orders o ON u.id = o.user_id RIGHT JOIN payments p ON o.id = p.order_id;");
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.type.isTop).toBe(true);
  });

  it("sql() state doc line count is correct", () => {
    const state = EditorState.create({
      doc: "SELECT id, name\nFROM users\nWHERE active = 1",
      extensions: [sql()],
    });
    expect(state.doc.lines).toBe(3);
  });

  it("sql() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "SELECT *\nFROM orders\nLIMIT 10",
      extensions: [sql()],
    });
    expect(state.doc.line(1).text).toBe("SELECT *");
    expect(state.doc.line(2).text).toBe("FROM orders");
  });

  it("sql() state allows mutation via transaction", () => {
    let state = EditorState.create({ doc: "SELECT 1", extensions: [sql()] });
    state = state.update({ changes: { from: 8, insert: ";\nSELECT 2" } }).state;
    expect(state.doc.lines).toBe(2);
  });

  it("sql() state doc length invariant holds", () => {
    const doc = "SELECT id FROM users;";
    const state = EditorState.create({ doc, extensions: [sql()] });
    expect(state.doc.length).toBe(doc.length);
  });

  it("sql() state replacement transaction works", () => {
    let state = EditorState.create({ doc: "SELECT * FROM users", extensions: [sql()] });
    state = state.update({ changes: { from: 7, to: 8, insert: "id, name" } }).state;
    expect(state.doc.toString()).toContain("id, name");
  });

  it("sql() state doc line text is accessible", () => {
    const state = EditorState.create({
      doc: "SELECT id\nFROM users\nWHERE active = 1",
      extensions: [sql()],
    });
    expect(state.doc.line(1).text).toBe("SELECT id");
    expect(state.doc.line(3).text).toBe("WHERE active = 1");
  });

  it("sql() state deletion transaction works", () => {
    let state = EditorState.create({ doc: "SELECT id\nFROM users", extensions: [sql()] });
    state = state.update({ changes: { from: 9, to: 20 } }).state;
    expect(state.doc.toString()).toBe("SELECT id");
  });

  it("sql() state allows multiple sequential transactions", () => {
    let state = EditorState.create({ doc: "SELECT *", extensions: [sql()] });
    state = state.update({ changes: { from: 8, insert: "\nFROM users" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\nWHERE id = 1" } }).state;
    expect(state.doc.lines).toBe(3);
    expect(state.doc.line(2).text).toBe("FROM users");
  });

  it("sql() state with unicode content works", () => {
    const doc = "-- こんにちは\nSELECT 1;";
    const state = EditorState.create({ doc, extensions: [sql()] });
    expect(state.doc.toString()).toBe(doc);
  });

  it("sql() StandardSQL parser tree has correct length", () => {
    const code = "SELECT id, name FROM users;";
    const tree = StandardSQL.language.parser.parse(code);
    expect(tree.length).toBe(code.length);
  });

  it("sql() state allows 4 sequential transactions", () => {
    let state = EditorState.create({ doc: "SELECT *", extensions: [sql()] });
    state = state.update({ changes: { from: 8, insert: "\nFROM t" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\nWHERE id = 1" } }).state;
    state = state.update({ changes: { from: state.doc.length, insert: "\nLIMIT 10" } }).state;
    expect(state.doc.lines).toBe(4);
  });

  it("sql() state allows deletion of entire content", () => {
    const doc = "SELECT * FROM users;";
    let state = EditorState.create({ doc, extensions: [sql()] });
    state = state.update({ changes: { from: 0, to: doc.length } }).state;
    expect(state.doc.toString()).toBe("");
  });
});
