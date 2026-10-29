import { z } from 'zod';
import { newCohortCode, newLeadToken, newStudentCode, sha256 } from './codes';
import type { Content } from './schema';
import type { Store } from './store';

/** Labels for each student, or how many unlabelled codes to create. */
const studentsSchema = z.union([z.number().int().min(1).max(200), z.array(z.string().trim().min(1).max(80)).min(1).max(200)]);

const createCohortSchema = z.object({
	course: z.string(),
	label: z.string().trim().min(1).max(120),
	startsOn: z.iso.date().optional(),
	leadPage: z.boolean().default(false),
	students: studentsSchema.optional(),
});

const addStudentsSchema = z.object({ students: studentsSchema });

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body, null, 2), {
		status,
		headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
	});

async function isAdmin(request: Request, adminToken: string | undefined): Promise<boolean> {
	const given = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
	if (!adminToken || !given) return false;
	// Comparing digests keeps the comparison time independent of where the strings differ.
	return (await sha256(given)) === (await sha256(adminToken));
}

async function createStudents(store: Store, cohortCode: string, origin: string, students: z.infer<typeof studentsSchema>) {
	const labels = typeof students === 'number' ? Array.from({ length: students }, () => null) : students;
	const created = labels.map((label) => ({ label, code: newStudentCode() }));
	await store.addStudents(
		cohortCode,
		await Promise.all(created.map(async (s) => ({ label: s.label, codeHash: await sha256(s.code) }))),
	);
	return created.map((s) => ({ label: s.label, connectorUrl: `${origin}/mcp/${s.code}` }));
}

/**
 * Admin API, used with curl until there is an admin page. Personal links and the lead link are
 * returned only here, once: the database keeps their hashes.
 *
 *   POST /admin/cohorts                  {course, label, startsOn?, leadPage?, students?}
 *   POST /admin/cohorts/:code/students   {students}
 */
export async function handleAdmin(request: Request, url: URL, env: { ADMIN_TOKEN?: string }, store: Store, content: Content) {
	if (!(await isAdmin(request, env.ADMIN_TOKEN))) return json({ error: 'unauthorized' }, 401);
	if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405);
	const body = await request.json().catch(() => null);

	if (url.pathname === '/admin/cohorts') {
		const parsed = createCohortSchema.safeParse(body);
		if (!parsed.success) return json({ error: z.prettifyError(parsed.error) }, 400);
		const { course, label, startsOn, leadPage, students } = parsed.data;
		if (!content.courses[course]) return json({ error: `unknown course "${course}"`, courses: Object.keys(content.courses) }, 400);
		const code = newCohortCode();
		const leadToken = leadPage ? newLeadToken() : null;
		await store.createCohort({ code, course, label, startsOn: startsOn ?? null }, leadToken && (await sha256(leadToken)));
		return json(
			{
				cohort: code,
				sharedConnectorUrl: `${url.origin}/mcp/${code}`,
				...(leadToken && { leadPageUrl: `${url.origin}/equipo/${leadToken}` }),
				...(students && { students: await createStudents(store, code, url.origin, students) }),
			},
			201,
		);
	}

	const addTo = url.pathname.match(/^\/admin\/cohorts\/([^/]+)\/students$/)?.[1];
	if (addTo) {
		const parsed = addStudentsSchema.safeParse(body);
		if (!parsed.success) return json({ error: z.prettifyError(parsed.error) }, 400);
		if (!(await store.cohort(addTo))) return json({ error: 'unknown cohort' }, 404);
		return json({ students: await createStudents(store, addTo, url.origin, parsed.data.students) }, 201);
	}

	return json({ error: 'not found' }, 404);
}
