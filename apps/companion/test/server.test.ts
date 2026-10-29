import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { beforeEach, describe, expect, test } from 'bun:test';
import { contentSchema } from '../src/schema';
import { createServer, type Access } from '../src/server';
import { Store } from '../src/store';
import { course } from './fixtures';
import { testDb } from './d1';

const content = contentSchema.parse({
	courses: { prueba: course },
	glossary: [{ id: 'agente', term: 'Agente', explanation: 'Planea y usa herramientas.', seeAlso: 'Diapositivas 16 y 17.' }],
	rules: [{ title: 'Verifica', body: 'Comprueba los datos.' }],
});
const cohort = { code: 'g-23456789', course: 'prueba', label: 'Grupo', startsOn: null };

let store: Store;
let studentId: number;

beforeEach(async () => {
	store = new Store(testDb());
	await store.createCohort(cohort, null);
	await store.addStudents(cohort.code, [{ codeHash: 'hash', label: 'Ana' }]);
	studentId = (await store.student('hash'))!.student.id;
});

async function connect(access: Access) {
	const server = createServer({ access, content, store, today: new Date('2026-11-02T12:00:00Z') });
	const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
	await server.connect(serverSide);
	const client = new Client({ name: 'test', version: '1' });
	await client.connect(clientSide);
	const call = async (name: string, args: Record<string, unknown> = {}) => {
		const result = await client.callTool({ name, arguments: args });
		const [first] = result.content as { type: 'text'; text: string }[];
		return JSON.parse(first.text);
	};
	return { client, call };
}

const asStudent = () => connect({ kind: 'student', cohort, student: { id: studentId, label: 'Ana' } });

test('lists the tools, resources and prompts', async () => {
	const { client } = await connect({ kind: 'public' });
	const tools = (await client.listTools()).tools.map((t) => t.name);
	expect(tools).toEqual(['listar_cursos', 'ver_curso', 'hoy', 'ver_ejercicio', 'explicar', 'revisar_entrega', 'marcar_hecho', 'mi_progreso']);
	expect((await client.listPrompts()).prompts.map((p) => p.name)).toEqual(['empezar-sesion', 'revisar-mi-entrega', 'me-he-atascado']);
	const resources = (await client.listResources()).resources.map((r) => r.uri);
	expect(resources).toContain('curso://reglas');
	expect(resources).toContain('curso://cursos/prueba');
	const page = await client.readResource({ uri: 'curso://cursos/prueba' });
	expect((page.contents[0] as { text: string }).text).toContain('## Semana 2: Dos');
});

describe('without a code', () => {
	test('hoy asks which course, then works with one', async () => {
		const { call } = await connect({ kind: 'public' });
		expect((await call('hoy')).instruccion).toContain('listar_cursos');
		const today = await call('hoy', { curso: 'prueba' });
		expect(today).toMatchObject({ semana: 1, siguienteEjercicio: { id: 'a' } });
		expect(today.progreso).toContain('No se guarda');
	});

	test('marcar_hecho explains that progress needs a personal link', async () => {
		const { call } = await connect({ kind: 'public' });
		expect(await call('marcar_hecho', { ejercicio: 'a' })).toMatchObject({ guardado: false });
	});
});

describe('with a personal code', () => {
	test('progress moves the student through the course', async () => {
		const { call } = await asStudent();
		expect((await call('hoy')).siguienteEjercicio.id).toBe('a');
		expect(await call('marcar_hecho', { ejercicio: 'a' })).toMatchObject({ guardado: true, yaEstabaHecho: false });
		expect(await call('marcar_hecho', { ejercicio: 'a' })).toMatchObject({ guardado: true, yaEstabaHecho: true });
		expect((await call('hoy')).siguienteEjercicio.id).toBe('b');
		await call('marcar_hecho', { ejercicio: 'b' });
		const week2 = await call('hoy');
		expect(week2).toMatchObject({ semana: 2, titulo: 'Dos' });
		expect(week2.instruccion).toContain('aún no tiene ejercicios');
		expect((await call('mi_progreso')).semanas[0]).toMatchObject({ hechos: ['A', 'B'], pendientes: [] });
		expect(await store.done(studentId)).toEqual(['a', 'b']);
	});

	test('rejects an exercise from outside the course', async () => {
		const { call } = await asStudent();
		expect(await call('marcar_hecho', { ejercicio: 'z' })).toMatchObject({ guardado: false });
		expect(await store.done(studentId)).toEqual([]);
	});

	test('hoy can show another week, and refuses one past the end', async () => {
		const { call } = await asStudent();
		expect(await call('hoy', { semana: 3 })).toMatchObject({ semana: 3, siguienteEjercicio: { id: 'c' } });
		expect((await call('hoy', { semana: 9 })).instruccion).toContain('3 semanas');
	});
});

test('revisar_entrega returns the written rubric or the fallback', async () => {
	const { call } = await asStudent();
	expect(await call('revisar_entrega')).toMatchObject({ semana: 1, criterios: ['Criterio escrito'] });
	expect((await call('revisar_entrega', { semana: 2 })).criterios).toHaveLength(2);
});

test('explicar answers from the glossary', async () => {
	const { call } = await connect({ kind: 'public' });
	expect((await call('explicar', { concepto: 'qué es un agente' })).conceptos[0]).toMatchObject({
		termino: 'Agente',
		dondeSeVe: 'Diapositivas 16 y 17.',
	});
	expect((await call('explicar', { concepto: 'blockchain' })).instruccion).toContain('no tiene una explicación');
});

test('cohortProgress lists every student, with or without progress', async () => {
	await store.addStudents(cohort.code, [{ codeHash: 'hash2', label: null }]);
	await store.markDone(studentId, 'a');
	expect(await store.cohortProgress(cohort.code)).toEqual([
		{ id: studentId, label: 'Ana', done: ['a'] },
		{ id: studentId + 1, label: null, done: [] },
	]);
});
