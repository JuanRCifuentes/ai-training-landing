export type ModuleLevel = 'Introductorio' | 'Intermedio' | 'Avanzado' | 'Transversal' | 'Dirección';

export interface Module {
	/** Two-digit reference shown on cards and in role paths, e.g. "03". */
	ref: string;
	/** URL segment of the module page, e.g. "fundamentos-de-ia". */
	slug: string;
	title: string;
	summary: string;
	level: ModuleLevel;
	audience: string;
	/** Human-readable duration; undefined while it is still being defined. */
	duration?: string;
	prerequisites?: string;
	/** What participants are able to do after the module. */
	objectives: string[];
	/** Syllabus, in teaching order. */
	topics: string[];
}

export interface RolePath {
	role: string;
	/** Module refs that form the recommended base for this role. */
	core: string[];
	/** Module refs that are useful but optional. */
	optional: string[];
}

export interface Phase {
	step: string;
	title: string;
	summary: string;
	deliverable: string;
}

export interface Metric {
	dimension: string;
	measured: string;
	received: string;
}

export interface Fact {
	term: string;
	value: string;
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
}
