-- A cohort is one group taking one course. Its code goes in the shared connector URL.
CREATE TABLE cohorts (
	code TEXT PRIMARY KEY,
	course TEXT NOT NULL,
	label TEXT NOT NULL,
	-- ISO date of the first day of week 1; NULL for self-paced groups.
	starts_on TEXT,
	-- SHA-256 of the team lead's token for the progress page; NULL when the group has no lead page.
	lead_token_hash TEXT UNIQUE,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Students are known only by a code. The label is optional and set by whoever hands out the codes.
CREATE TABLE students (
	id INTEGER PRIMARY KEY,
	cohort_code TEXT NOT NULL REFERENCES cohorts(code) ON DELETE CASCADE,
	-- SHA-256 of the personal code; the code itself is shown once, when it is created.
	code_hash TEXT NOT NULL UNIQUE,
	label TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Only the fact that an exercise is done, never the student's work.
CREATE TABLE progress (
	student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
	exercise_id TEXT NOT NULL,
	done_at TEXT NOT NULL DEFAULT (datetime('now')),
	PRIMARY KEY (student_id, exercise_id)
);

CREATE INDEX students_cohort ON students(cohort_code);
