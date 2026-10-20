export type CourseLevel = 'básico' | 'práctico' | 'avanzado' | 'para todos';

export interface Course {
	/** Two-digit reference shared with the enterprise programme, e.g. "03". */
	ref: string;
	title: string;
	summary: string;
	level: CourseLevel;
	/** What the learner builds by the end of the course. */
	outcome: string;
}

export interface Shift {
	from: string;
	to: string;
}

export interface TitledItem {
	title: string;
	body: string;
}

export interface Link {
	href: string;
	label: string;
}

export interface FaqItem {
	question: string;
	answer: string;
	link?: Link;
}

export type TerminalTokenKind = 'text' | 'prompt' | 'comment' | 'key' | 'caret';

export interface TerminalToken {
	text: string;
	kind?: TerminalTokenKind;
}

/** One line of a terminal window; an empty array renders a blank line. */
export type TerminalLine = TerminalToken[];
