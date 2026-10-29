import { Database } from 'bun:sqlite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The slice of D1 the Store uses, backed by an in-memory SQLite with the real migrations applied. */
export function testDb(): D1Database {
	const db = new Database(':memory:');
	db.exec('PRAGMA foreign_keys = ON');
	db.exec(readFileSync(join(import.meta.dir, '../migrations/0001_init.sql'), 'utf8'));

	const statement = (sql: string, params: unknown[] = []) => ({
		bind: (...values: unknown[]) => statement(sql, values),
		first: async () => db.query(sql).get(...(params as [])) ?? null,
		all: async () => ({ results: db.query(sql).all(...(params as [])) }),
		run: async () => ({ meta: { changes: db.query(sql).run(...(params as [])).changes } }),
	});

	return {
		prepare: (sql: string) => statement(sql),
		batch: async (statements: { run: () => Promise<unknown> }[]) => {
			db.exec('BEGIN');
			const results = [];
			for (const s of statements) results.push(await s.run());
			db.exec('COMMIT');
			return results;
		},
	} as unknown as D1Database;
}
