export interface Cohort {
	code: string;
	course: string;
	label: string;
	startsOn: string | null;
}

export interface Student {
	id: number;
	label: string | null;
}

export interface StudentProgress extends Student {
	done: string[];
}

interface CohortRow {
	code: string;
	course: string;
	label: string;
	starts_on: string | null;
}

const toCohort = (row: CohortRow): Cohort => ({
	code: row.code,
	course: row.course,
	label: row.label,
	startsOn: row.starts_on,
});

/** All reads and writes to D1. Codes and tokens arrive already hashed. */
export class Store {
	constructor(private readonly db: D1Database) {}

	async cohort(code: string): Promise<Cohort | null> {
		const row = await this.db.prepare('SELECT * FROM cohorts WHERE code = ?').bind(code).first<CohortRow>();
		return row && toCohort(row);
	}

	async cohortByLeadToken(tokenHash: string): Promise<Cohort | null> {
		const row = await this.db
			.prepare('SELECT * FROM cohorts WHERE lead_token_hash = ?')
			.bind(tokenHash)
			.first<CohortRow>();
		return row && toCohort(row);
	}

	async student(codeHash: string): Promise<{ student: Student; cohort: Cohort } | null> {
		const row = await this.db
			.prepare(
				`SELECT s.id, s.label AS student_label, c.code, c.course, c.label, c.starts_on
				 FROM students s JOIN cohorts c ON c.code = s.cohort_code WHERE s.code_hash = ?`,
			)
			.bind(codeHash)
			.first<CohortRow & { id: number; student_label: string | null }>();
		return row && { student: { id: row.id, label: row.student_label }, cohort: toCohort(row) };
	}

	async createCohort(cohort: Cohort, leadTokenHash: string | null): Promise<void> {
		await this.db
			.prepare('INSERT INTO cohorts (code, course, label, starts_on, lead_token_hash) VALUES (?, ?, ?, ?, ?)')
			.bind(cohort.code, cohort.course, cohort.label, cohort.startsOn, leadTokenHash)
			.run();
	}

	async addStudents(cohortCode: string, students: { codeHash: string; label: string | null }[]): Promise<void> {
		const insert = this.db.prepare('INSERT INTO students (cohort_code, code_hash, label) VALUES (?, ?, ?)');
		await this.db.batch(students.map((s) => insert.bind(cohortCode, s.codeHash, s.label)));
	}

	/** Returns false when the exercise was already marked done. */
	async markDone(studentId: number, exerciseId: string): Promise<boolean> {
		const result = await this.db
			.prepare('INSERT OR IGNORE INTO progress (student_id, exercise_id) VALUES (?, ?)')
			.bind(studentId, exerciseId)
			.run();
		return result.meta.changes > 0;
	}

	async done(studentId: number): Promise<string[]> {
		const { results } = await this.db
			.prepare('SELECT exercise_id FROM progress WHERE student_id = ? ORDER BY done_at, exercise_id')
			.bind(studentId)
			.all<{ exercise_id: string }>();
		return results.map((r) => r.exercise_id);
	}

	async cohortProgress(cohortCode: string): Promise<StudentProgress[]> {
		const { results } = await this.db
			.prepare(
				`SELECT s.id, s.label, p.exercise_id FROM students s
				 LEFT JOIN progress p ON p.student_id = s.id
				 WHERE s.cohort_code = ? ORDER BY s.id`,
			)
			.bind(cohortCode)
			.all<{ id: number; label: string | null; exercise_id: string | null }>();
		const students = new Map<number, StudentProgress>();
		for (const row of results) {
			const student = students.get(row.id) ?? { id: row.id, label: row.label, done: [] };
			if (row.exercise_id) student.done.push(row.exercise_id);
			students.set(row.id, student);
		}
		return [...students.values()];
	}
}
