import { currentWeek } from './course';
import type { Content } from './schema';
import type { Cohort, StudentProgress } from './store';

const escape = (text: string) =>
	text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const style = `
:root{color-scheme:light dark;--bg:#fff;--ink:#16161d;--muted:#5d5d6b;--line:#e2e2ea;--accent:#5b2ee6;--soft:#efeafe}
@media (prefers-color-scheme:dark){:root{--bg:#0c0c0f;--ink:#f1f1f5;--muted:#a4a4b3;--line:#2a2a33;--accent:#a58bff;--soft:#1e1836}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:880px;margin:0 auto;padding:32px 16px 56px}
h1{font-size:1.6rem;line-height:1.2;margin:0 0 8px}
p{margin:0 0 16px;color:var(--muted)}
code{background:var(--soft);padding:2px 6px;border-radius:4px;font-size:.9em;overflow-wrap:anywhere}
.scroll{overflow-x:auto}
table{border-collapse:collapse;width:100%;min-width:480px}
th,td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-size:.85rem;color:var(--muted);font-weight:600}
td.num{font-variant-numeric:tabular-nums}
.now{color:var(--accent);font-weight:600}
ol li{margin-bottom:8px}`;

function page(title: string, body: string): Response {
	const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escape(title)}</title><style>${style}</style></head><body><main>${body}</main></body></html>`;
	return new Response(html, {
		headers: {
			'content-type': 'text/html; charset=utf-8',
			'cache-control': 'no-store',
			'referrer-policy': 'no-referrer',
			'x-frame-options': 'DENY',
		},
	});
}

/** How to connect, for anyone who opens the server's address in a browser. */
export function homePage(origin: string): Response {
	return page(
		'Compañero del curso',
		`<h1>Compañero del curso</h1>
<p>Conecta el compañero a tu asistente de IA y te dirá qué toca cada semana, te explicará los conceptos del curso y revisará contigo tus entregas.</p>
<ol>
<li>Copia el enlace que te ha dado tu formador. Empieza por <code>${escape(origin)}/mcp/</code>.</li>
<li><strong>Claude:</strong> Configuración, Conectores, Añadir conector personalizado, y pega el enlace.</li>
<li><strong>ChatGPT:</strong> Configuración, Aplicaciones y conectores, Crear, y pega el enlace.</li>
<li>Escribe «¿qué me toca hoy en el curso?».</li>
</ol>
<p>No guardamos lo que escribes ni tu trabajo. Con un enlace personal guardamos solo qué ejercicios has terminado.</p>`,
	);
}

/** Progress of a whole group for its team lead: exercises done per week, no content. */
export function leadPage(cohort: Cohort, students: StudentProgress[], content: Content, today: Date): Response {
	const course = content.courses[cohort.course];
	const position = cohort.startsOn ? currentWeek(course, cohort.startsOn, [], today) : null;
	const now = position && !position.outside ? position.number : null;
	const head = course.weeks
		.map((w, i) => `<th${i + 1 === now ? ' class="now"' : ''} title="${escape(w.title)}">Semana ${i + 1}</th>`)
		.join('');
	const rows = students
		.map((s, n) => {
			const cells = course.weeks
				.map((w) => {
					const done = w.exercises.filter((e) => s.done.includes(e.id)).length;
					return `<td class="num">${w.exercises.length ? `${done} de ${w.exercises.length}` : '–'}</td>`;
				})
				.join('');
			return `<tr><td>${escape(s.label ?? `Alumno ${n + 1}`)}</td>${cells}</tr>`;
		})
		.join('');
	const table = students.length
		? `<div class="scroll"><table><thead><tr><th>Alumno</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>`
		: '<p>Este grupo aún no tiene alumnos con enlace personal.</p>';
	return page(
		`Progreso · ${cohort.label}`,
		`<h1>${escape(cohort.label)}</h1>
<p>${escape(course.title)}${now ? `. Esta semana: <span class="now">semana ${now}</span>.` : '.'} Ejercicios terminados por semana. No se muestra ni se guarda el trabajo de nadie.</p>
${table}`,
	);
}
