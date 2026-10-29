import { courseSchema } from '../src/schema';

/** Three weeks: one with exercises and a rubric, one with nothing written yet, one with an exercise. */
export const course = courseSchema.parse({
	name: 'Prueba',
	order: 1,
	title: 'Curso de prueba',
	summary: 'Resumen',
	lead: 'Entradilla',
	tools: ['Claude'],
	weeks: [
		{
			title: 'Uno',
			goal: 'Objetivo 1',
			outcome: 'Resultado 1',
			exercises: [
				{ id: 'a', title: 'A', minutes: 10, steps: ['Paso'] },
				{ id: 'b', title: 'B', minutes: 10, steps: ['Paso'] },
			],
			rubric: ['Criterio escrito'],
		},
		{ title: 'Dos', goal: 'Objetivo 2', outcome: 'Resultado 2' },
		{ title: 'Tres', goal: 'Objetivo 3', outcome: 'Resultado 3', exercises: [{ id: 'c', title: 'C', minutes: 5, steps: ['Paso'] }] },
	],
});
