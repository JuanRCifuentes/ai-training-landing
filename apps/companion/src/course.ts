import type { Concept, Content, Course, Exercise, Week } from './schema';

export interface WeekPosition {
	/** 1-based. */
	number: number;
	week: Week;
	/** Set when the dates put the student outside the course: before week 1 or after the last week. */
	outside?: 'before' | 'after';
}

const dayMs = 86_400_000;

/**
 * The week a student should work on. A dated cohort follows the calendar from `startsOn`; a self-paced
 * one stops at the first week that still has an exercise to do (or has none written yet, since nothing
 * there can be marked done).
 */
export function currentWeek(course: Course, startsOn: string | null, done: string[], today: Date): WeekPosition {
	const last = course.weeks.length;
	const at = (number: number, outside?: WeekPosition['outside']): WeekPosition => ({
		number,
		week: course.weeks[number - 1],
		...(outside && { outside }),
	});
	if (startsOn) {
		const elapsed = Math.floor((today.getTime() - Date.parse(startsOn)) / dayMs);
		if (elapsed < 0) return at(1, 'before');
		const number = Math.floor(elapsed / 7) + 1;
		return number > last ? at(last, 'after') : at(number);
	}
	const index = course.weeks.findIndex((w) => w.exercises.length === 0 || w.exercises.some((e) => !done.includes(e.id)));
	return index === -1 ? at(last, 'after') : at(index + 1);
}

export const nextExercise = (week: Week, done: string[]): Exercise | undefined =>
	week.exercises.find((e) => !done.includes(e.id));

export function findExercise(course: Course, id: string): { weekNumber: number; exercise: Exercise } | undefined {
	for (const [i, week] of course.weeks.entries()) {
		const exercise = week.exercises.find((e) => e.id === id);
		if (exercise) return { weekNumber: i + 1, exercise };
	}
}

/** The week's rubric, or one built from its outcome and the usage rules while none is written. */
export function rubric(week: Week, rules: Content['rules']): string[] {
	if (week.rubric.length > 0) return week.rubric;
	return [`La entrega cumple el resultado de la semana: ${week.outcome}`, ...rules.map((r) => `${r.title}: ${r.body}`)];
}

const normalize = (text: string) =>
	text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.trim();

/** Concepts whose term or aliases match the query, best match first, at most three. */
export function findConcepts(glossary: Concept[], query: string): Concept[] {
	const q = normalize(query);
	if (!q) return [];
	const scored = glossary.map((concept) => {
		const names = [concept.id.replaceAll('-', ' '), concept.term, ...concept.aliases].map(normalize);
		const score = names.some((n) => n === q) ? 3 : names.some((n) => q.includes(n)) ? 2 : names.some((n) => n.includes(q)) ? 1 : 0;
		return { concept, score };
	});
	return scored
		.filter((s) => s.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, 3)
		.map((s) => s.concept);
}
