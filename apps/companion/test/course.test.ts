import { describe, expect, test } from 'bun:test';
import { currentWeek, findConcepts, nextExercise, rubric } from '../src/course';
import type { Content } from '../src/schema';
import { course } from './fixtures';

const day = (iso: string) => new Date(`${iso}T12:00:00Z`);

describe('currentWeek', () => {
	test('follows the calendar for a dated cohort', () => {
		expect(currentWeek(course, '2026-11-02', [], day('2026-11-02')).number).toBe(1);
		expect(currentWeek(course, '2026-11-02', [], day('2026-11-08')).number).toBe(1);
		expect(currentWeek(course, '2026-11-02', [], day('2026-11-09')).number).toBe(2);
	});

	test('flags dates before and after the course', () => {
		expect(currentWeek(course, '2026-11-02', [], day('2026-10-30'))).toMatchObject({ number: 1, outside: 'before' });
		expect(currentWeek(course, '2026-11-02', [], day('2027-01-01'))).toMatchObject({ number: 3, outside: 'after' });
	});

	test('a self-paced student stays on a week until its exercises are done', () => {
		expect(currentWeek(course, null, ['a'], day('2026-11-02')).number).toBe(1);
		// Week 2 has no exercises yet, so it cannot be completed and the student stays there.
		expect(currentWeek(course, null, ['a', 'b'], day('2026-11-02')).number).toBe(2);
	});
});

test('nextExercise skips what is done', () => {
	expect(nextExercise(course.weeks[0], ['a'])?.id).toBe('b');
	expect(nextExercise(course.weeks[0], ['a', 'b'])).toBeUndefined();
});

test('rubric falls back to the outcome and the rules', () => {
	const rules: Content['rules'] = [{ title: 'Verifica', body: 'Comprueba los datos.' }];
	expect(rubric(course.weeks[0], rules)).toEqual(['Criterio escrito']);
	expect(rubric(course.weeks[1], rules)).toEqual(['La entrega cumple el resultado de la semana: Resultado 2', 'Verifica: Comprueba los datos.']);
});

test('findConcepts matches terms and aliases, ignoring case and accents', () => {
	const glossary = [
		{ id: 'ventana-de-contexto', term: 'Ventana de contexto', aliases: ['olvida'], explanation: '' },
		{ id: 'agente', term: 'Agente', aliases: ['automatización'], explanation: '' },
	];
	expect(findConcepts(glossary, 'VENTANA DE CONTEXTO').map((c) => c.id)).toEqual(['ventana-de-contexto']);
	expect(findConcepts(glossary, '¿por qué se olvida de lo que dije?').map((c) => c.id)).toEqual(['ventana-de-contexto']);
	expect(findConcepts(glossary, 'automatizacion').map((c) => c.id)).toEqual(['agente']);
	expect(findConcepts(glossary, 'blockchain')).toEqual([]);
});
