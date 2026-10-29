import { describe, expect, test } from 'bun:test';
import worker, { type Env } from '../src/index';
import { testDb } from './d1';

const env = (): Env => ({ DB: testDb(), ADMIN_TOKEN: 'secret' });
const origin = 'https://companion.test';

const admin = (e: Env, path: string, body: unknown, token = 'secret') =>
	worker.fetch(
		new Request(`${origin}${path}`, {
			method: 'POST',
			headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
			body: JSON.stringify(body),
		}),
		e,
	);

const rpc = (e: Env, path: string, method: string, params: unknown = {}) =>
	worker.fetch(
		new Request(`${origin}${path}`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				accept: 'application/json, text/event-stream',
				'mcp-protocol-version': '2025-06-18',
			},
			body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
		}),
		e,
	);

// Response bodies in these tests are loosely typed on purpose: the assertions check their shape.
const body = async (response: Response): Promise<any> => response.json();
const toolText = async (response: Response) => JSON.parse((await body(response)).result.content[0].text);

describe('admin API', () => {
	test('refuses a wrong token', async () => {
		expect((await admin(env(), '/admin/cohorts', {}, 'nope')).status).toBe(401);
	});

	test('refuses an unknown course', async () => {
		expect((await admin(env(), '/admin/cohorts', { course: 'astronautas', label: 'G' })).status).toBe(400);
	});

	test('creates a cohort with personal links and a lead page', async () => {
		const e = env();
		const response = await admin(e, '/admin/cohorts', {
			course: 'freelancers',
			label: 'Freelancers noviembre',
			startsOn: '2026-11-02',
			leadPage: true,
			students: ['Ana', 'Luis'],
		});
		expect(response.status).toBe(201);
		const created = await body(response);
		expect(created.sharedConnectorUrl).toMatch(/^https:\/\/companion\.test\/mcp\/g-[2-9a-z]{8}$/);
		expect(created.students.map((s: { label: string }) => s.label)).toEqual(['Ana', 'Luis']);

		const more = await body(await admin(e, `/admin/cohorts/${created.cohort}/students`, { students: 1 }));
		expect(more.students).toHaveLength(1);

		const lead = await worker.fetch(new Request(created.leadPageUrl), e);
		expect(lead.status).toBe(200);
		const html = await lead.text();
		expect(html).toContain('Freelancers noviembre');
		expect(html).toContain('<td>Luis</td>');
		expect(html).toContain('Alumno 3');

		// The personal link reaches the MCP server and knows the course.
		const path = new URL(created.students[0].connectorUrl).pathname;
		const today = await toolText(await rpc(e, path, 'tools/call', { name: 'hoy', arguments: {} }));
		expect(today).toMatchObject({ curso: 'freelancers', deSemanas: 4 });
		expect(today.progreso).toBeUndefined();
	});
});

describe('routing', () => {
	test('an unknown code or lead token is a 404', async () => {
		const e = env();
		expect((await rpc(e, '/mcp/a-222222222222', 'tools/list')).status).toBe(404);
		expect((await rpc(e, '/mcp/whatever', 'tools/list')).status).toBe(404);
		expect((await worker.fetch(new Request(`${origin}/equipo/e-${'2'.repeat(24)}`), e)).status).toBe(404);
	});

	test('the public endpoint serves the real course content', async () => {
		const response = await rpc(env(), '/mcp', 'tools/call', { name: 'listar_cursos', arguments: {} });
		expect(response.headers.get('access-control-allow-origin')).toBe('*');
		const { cursos } = await toolText(response);
		expect(cursos.map((c: { curso: string }) => c.curso)).toContain('freelancers');
	});

	test('the home page explains how to connect', async () => {
		const response = await worker.fetch(new Request(`${origin}/`), env());
		expect(await response.text()).toContain('https://companion.test/mcp/');
	});
});
