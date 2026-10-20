export type ModuleLevel = 'Introductorio' | 'Intermedio' | 'Avanzado' | 'Transversal' | 'Dirección';

export interface Module {
	/** Two-digit reference shown on cards and in role paths, e.g. "03". */
	ref: string;
	title: string;
	summary: string;
	level: ModuleLevel;
	audience: string;
	/** Human-readable duration; undefined while it is still being defined. */
	duration?: string;
	prerequisites?: string;
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

export interface FaqItem {
	question: string;
	answer: string;
}
