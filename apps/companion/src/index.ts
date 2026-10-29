import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { handleAdmin } from './admin';
import { isCohortCode, isLeadToken, isStudentCode, sha256 } from './codes';
import generated from './generated/content.json';
import { homePage, leadPage } from './pages';
import { contentSchema } from './schema';
import { createServer, type Access } from './server';
import { Store } from './store';

export interface Env {
	DB: D1Database;
	/** Secret for the admin API; without it the admin API answers 401. */
	ADMIN_TOKEN?: string;
	/** Optional Workers rate limiting binding, keyed by client IP. */
	LIMITER?: RateLimit;
}

// Validated by scripts/build-content.ts; parsed again here to apply the schema's defaults and types.
const content = contentSchema.parse(generated);

const cors = {
	'access-control-allow-origin': '*',
	'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
	'access-control-allow-headers': 'content-type, accept, mcp-protocol-version, mcp-session-id, last-event-id',
	'access-control-expose-headers': 'mcp-session-id',
};

const notFound = () => new Response('Not found', { status: 404 });

async function resolveAccess(code: string | undefined, store: Store): Promise<Access | null> {
	if (!code) return { kind: 'public' };
	if (isStudentCode(code)) {
		const found = await store.student(await sha256(code));
		return found && { kind: 'student', ...found };
	}
	if (isCohortCode(code)) {
		const cohort = await store.cohort(code);
		return cohort && { kind: 'cohort', cohort };
	}
	return null;
}

async function handleMcp(request: Request, access: Access, store: Store): Promise<Response> {
	// Stateless: every request gets its own server, so no session lives between requests.
	const server = createServer({ access, content, store, today: new Date() });
	const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
	await server.connect(transport);
	const response = await transport.handleRequest(request);
	const headers = new Headers(response.headers);
	for (const [name, value] of Object.entries(cors)) headers.set(name, value);
	return new Response(response.body, { status: response.status, headers });
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const store = new Store(env.DB);

		if (env.LIMITER) {
			const { success } = await env.LIMITER.limit({ key: request.headers.get('cf-connecting-ip') ?? 'unknown' });
			if (!success) return new Response('Too many requests', { status: 429 });
		}

		const mcp = url.pathname.match(/^\/mcp(?:\/([^/]+))?\/?$/);
		if (mcp) {
			if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
			const access = await resolveAccess(mcp[1], store);
			return access ? handleMcp(request, access, store) : notFound();
		}

		const lead = url.pathname.match(/^\/equipo\/([^/]+)\/?$/)?.[1];
		if (lead && request.method === 'GET') {
			if (!isLeadToken(lead)) return notFound();
			const cohort = await store.cohortByLeadToken(await sha256(lead));
			if (!cohort) return notFound();
			return leadPage(cohort, await store.cohortProgress(cohort.code), content, new Date());
		}

		if (url.pathname.startsWith('/admin/')) return handleAdmin(request, url, env, store, content);
		if (url.pathname === '/' && request.method === 'GET') return homePage(url.origin);
		return notFound();
	},
} satisfies ExportedHandler<Env>;
