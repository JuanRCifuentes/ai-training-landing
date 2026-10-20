import type { TerminalLine } from './types';

/** Before/after prompt shown in the hero. */
export const promptExample: TerminalLine[] = [
	[{ kind: 'comment', text: '# antes' }],
	[{ kind: 'prompt', text: '>' }, { text: ' hazme un resumen de esto' }],
	[],
	[{ kind: 'comment', text: '# después del curso 02' }],
	[{ kind: 'prompt', text: '>' }, { text: ' ' }, { kind: 'key', text: 'Rol:' }, { text: ' analista de operaciones.' }],
	[{ text: '  ' }, { kind: 'key', text: 'Contexto:' }, { text: ' acta de la reunión adjunta.' }],
	[{ text: '  ' }, { kind: 'key', text: 'Tarea:' }, { text: ' 5 decisiones, responsable y fecha.' }],
	[{ text: '  ' }, { kind: 'key', text: 'Formato:' }, { text: ' tabla. Si falta un dato, dilo.' }],
	[],
	[{ kind: 'comment', text: '✓ 5 decisiones · 2 sin fecha marcadas' }],
	[{ kind: 'prompt', text: '>' }, { text: ' ' }, { kind: 'caret', text: '' }],
];
