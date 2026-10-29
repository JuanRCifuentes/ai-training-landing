import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { currentWeek, findConcepts, findExercise, nextExercise, rubric, type WeekPosition } from './course';
import type { Content, Course, Exercise } from './schema';
import type { Cohort, Store, Student } from './store';

/** Who is calling, from the code in the connector URL. */
export type Access =
	| { kind: 'public' }
	| { kind: 'cohort'; cohort: Cohort }
	| { kind: 'student'; cohort: Cohort; student: Student };

export interface Context {
	access: Access;
	content: Content;
	store: Store;
	today: Date;
}

/** Sent once at connection; every tool reply repeats what matters for that reply in `instruccion`. */
const instructions = `Eres el compañero del curso «IA en el trabajo». Ayudas a un alumno a seguir su curso.
- Responde siempre en español, con frases claras y sin jerga.
- Eres un entrenador: guía al alumno para que haga él los ejercicios con su propio material. No hagas la entrega por él.
- Antes de que el alumno pegue datos personales, de clientes o confidenciales, recuérdale que los quite o anonimice.
- Usa solo el contenido que te dan estas herramientas para hablar del curso. Si algo no está, dilo y sugiere preguntarlo al formador.
- Empieza cada sesión con la herramienta «hoy».`;

const noCourse =
	'El alumno no ha conectado el compañero con el enlace de su grupo. Pregúntale qué curso sigue (usa «listar_cursos») y vuelve a llamar con «curso».';

const reply = (payload: Record<string, unknown>) => ({
	content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
});

const exerciseView = (e: Exercise) => ({
	id: e.id,
	titulo: e.title,
	minutos: e.minutes,
	pasos: e.steps,
	...(e.examplePrompt && { promptDeEjemplo: e.examplePrompt }),
	...(e.goodLooksLike.length > 0 && { comoSeVeUnBuenResultado: e.goodLooksLike }),
});

export function createServer(ctx: Context): McpServer {
	const { access, content, store } = ctx;
	const server = new McpServer({ name: 'companero-del-curso', version: '0.1.0' }, { instructions });
	const cohort = access.kind === 'public' ? undefined : access.cohort;
	const student = access.kind === 'student' ? access.student : undefined;

	/** The course to talk about: the cohort's, or the one the assistant names when connected without a code. */
	function resolveCourse(slug: string | undefined): { slug: string; course: Course } | { error: string } {
		const chosen = slug ?? cohort?.course;
		if (!chosen) return { error: noCourse };
		const course = content.courses[chosen];
		if (!course) return { error: `No existe el curso «${chosen}». Usa «listar_cursos» para ver los cursos.` };
		return { slug: chosen, course };
	}

	const done = () => (student ? store.done(student.id) : Promise.resolve([]));
	const courseArg = z
		.string()
		.optional()
		.describe('Identificador del curso, p. ej. «freelancers». Solo hace falta si el alumno no se conectó con el enlace de su grupo.');
	const readOnly = { readOnlyHint: true, openWorldHint: false };

	server.registerTool(
		'listar_cursos',
		{ title: 'Listar los cursos', description: 'Lista los cursos disponibles y dice cuál sigue el alumno.', annotations: readOnly },
		async () =>
			reply({
				cursoDelAlumno: cohort?.course ?? null,
				cursos: Object.entries(content.courses)
					.sort(([, a], [, b]) => a.order - b.order)
					.map(([slug, c]) => ({ curso: slug, nombre: c.name, resumen: c.summary, semanas: c.weeks.length })),
				instruccion: cohort
					? 'Recuerda al alumno en qué curso está. No hace falta enumerar los demás salvo que pregunte.'
					: 'Pregunta al alumno qué curso sigue y usa ese identificador en las demás herramientas.',
			}),
	);

	server.registerTool(
		'ver_curso',
		{
			title: 'Ver el curso',
			description: 'Programa completo del curso: semanas, objetivos, resultados y herramientas que conviene tener listas.',
			inputSchema: { curso: courseArg },
			annotations: readOnly,
		},
		async ({ curso }) => {
			const found = resolveCourse(curso);
			if ('error' in found) return reply({ instruccion: found.error });
			const { course } = found;
			return reply({
				curso: found.slug,
				titulo: course.title,
				descripcion: course.lead,
				herramientas: course.tools,
				semanas: course.weeks.map((w, i) => ({
					semana: i + 1,
					titulo: w.title,
					objetivo: w.goal,
					resultado: w.outcome,
					ejercicios: w.exercises.map((e) => ({ id: e.id, titulo: e.title, minutos: e.minutes })),
				})),
				instruccion: 'Resume el programa en pocas líneas y destaca la semana en la que está el alumno.',
			});
		},
	);

	server.registerTool(
		'hoy',
		{
			title: 'Qué toca hoy',
			description:
				'Semana actual del alumno, su siguiente ejercicio y la regla de uso de la semana. Llámala al empezar cada sesión.',
			inputSchema: {
				curso: courseArg,
				semana: z.number().int().positive().optional().describe('Para ver otra semana en lugar de la actual.'),
			},
			annotations: readOnly,
		},
		async ({ curso, semana }) => {
			const found = resolveCourse(curso);
			if ('error' in found) return reply({ instruccion: found.error });
			const { course } = found;
			const completed = await done();
			if (semana !== undefined && semana > course.weeks.length) {
				return reply({ instruccion: `El curso tiene ${course.weeks.length} semanas. Pregunta al alumno cuál quiere ver.` });
			}
			const position: WeekPosition = semana
				? { number: semana, week: course.weeks[semana - 1] }
				: currentWeek(course, found.slug === cohort?.course ? cohort.startsOn : null, completed, ctx.today);
			const { week } = position;
			const next = nextExercise(week, completed);
			const notes: string[] = [];
			if (position.outside === 'before') notes.push('El curso aún no ha empezado: esto es lo que verá en la semana 1.');
			if (position.outside === 'after') notes.push('El alumno ya ha pasado la última semana: ayúdale a cerrar lo pendiente.');
			let instruccion: string;
			if (next) {
				instruccion =
					'Presenta el ejercicio en dos o tres frases y guía al alumno paso a paso con su propio material. Cuando lo termine, llama a «marcar_hecho».';
			} else if (week.exercises.length === 0) {
				instruccion =
					'Esta semana aún no tiene ejercicios escritos. Ayuda al alumno a avanzar hacia el resultado de la semana con su propio trabajo, en pasos pequeños.';
			} else {
				instruccion = 'El alumno ha terminado los ejercicios de esta semana. Propón revisar la entrega con «revisar_entrega».';
			}
			return reply({
				curso: found.slug,
				semana: position.number,
				deSemanas: course.weeks.length,
				titulo: week.title,
				objetivo: week.goal,
				resultadoDeLaSemana: week.outcome,
				...(week.rule && { reglaDeLaSemana: week.rule }),
				...(next && { siguienteEjercicio: exerciseView(next) }),
				ejercicios: week.exercises.map((e) => ({ id: e.id, titulo: e.title, hecho: completed.includes(e.id) })),
				...(notes.length > 0 && { avisos: notes }),
				...(!student && { progreso: 'No se guarda: el alumno no usa un enlace personal.' }),
				instruccion,
			});
		},
	);

	server.registerTool(
		'ver_ejercicio',
		{
			title: 'Ver un ejercicio',
			description: 'Un ejercicio completo: pasos, prompt de ejemplo y cómo se ve un buen resultado.',
			inputSchema: { id: z.string().describe('Identificador del ejercicio, como lo devuelve «hoy».'), curso: courseArg },
			annotations: readOnly,
		},
		async ({ id, curso }) => {
			const found = resolveCourse(curso);
			if ('error' in found) return reply({ instruccion: found.error });
			const match = findExercise(found.course, id);
			if (!match) return reply({ instruccion: `No hay ningún ejercicio «${id}» en este curso. Usa «hoy» o «ver_curso».` });
			return reply({
				semana: match.weekNumber,
				...exerciseView(match.exercise),
				instruccion: 'Guía al alumno paso a paso. Deja que él haga el trabajo y revísalo con él.',
			});
		},
	);

	server.registerTool(
		'explicar',
		{
			title: 'Explicar un concepto',
			description: 'La explicación del curso para un concepto (p. ej. «ventana de contexto», «agente») y dónde se ve en la sesión.',
			inputSchema: { concepto: z.string().describe('El concepto o la duda, en palabras del alumno.') },
			annotations: readOnly,
		},
		async ({ concepto }) => {
			const matches = findConcepts(content.glossary, concepto);
			if (matches.length === 0) {
				return reply({
					conceptosDelCurso: content.glossary.map((c) => c.term),
					instruccion:
						'El curso no tiene una explicación para esto. Responde con tu conocimiento, di que no es material del curso y sugiere preguntarlo al formador.',
				});
			}
			return reply({
				conceptos: matches.map((c) => ({ termino: c.term, explicacion: c.explanation, ...(c.seeAlso && { dondeSeVe: c.seeAlso }) })),
				instruccion:
					'Explica el concepto con las palabras del curso, ponle un ejemplo del trabajo del alumno y dile dónde lo puede repasar.',
			});
		},
	);

	server.registerTool(
		'revisar_entrega',
		{
			title: 'Revisar la entrega de la semana',
			description:
				'Criterios para revisar lo que el alumno entrega al final de la semana. La revisión se hace en esta conversación; no se envía nada al curso.',
			inputSchema: { curso: courseArg, semana: z.number().int().positive().optional().describe('Por defecto, la semana actual.') },
			annotations: readOnly,
		},
		async ({ curso, semana }) => {
			const found = resolveCourse(curso);
			if ('error' in found) return reply({ instruccion: found.error });
			const { course } = found;
			const number =
				semana ?? currentWeek(course, found.slug === cohort?.course ? cohort.startsOn : null, await done(), ctx.today).number;
			const week = course.weeks[number - 1];
			if (!week) return reply({ instruccion: `El curso tiene ${course.weeks.length} semanas. Pregunta al alumno qué semana quiere revisar.` });
			return reply({
				semana: number,
				resultadoEsperado: week.outcome,
				criterios: rubric(week, content.rules),
				instruccion:
					'Pide al alumno que pegue o describa su entrega (sin datos confidenciales). Revisa cada criterio, di cuáles cumple y qué cambiaría en los demás. No reescribas la entrega por él.',
			});
		},
	);

	server.registerTool(
		'marcar_hecho',
		{
			title: 'Marcar un ejercicio como hecho',
			description: 'Guarda que el alumno terminó un ejercicio. Solo se guarda el hecho, nunca su trabajo.',
			inputSchema: { ejercicio: z.string().describe('Identificador del ejercicio.') },
			annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
		},
		async ({ ejercicio }) => {
			if (access.kind !== 'student') {
				return reply({
					guardado: false,
					instruccion:
						'El progreso solo se guarda con un enlace personal. Dile al alumno que se lo pida a su formador o a su responsable de equipo.',
				});
			}
			const match = findExercise(content.courses[access.cohort.course], ejercicio);
			if (!match) return reply({ guardado: false, instruccion: `No hay ningún ejercicio «${ejercicio}» en su curso. Usa «hoy».` });
			const isNew = await store.markDone(access.student.id, ejercicio);
			return reply({
				guardado: true,
				yaEstabaHecho: !isNew,
				instruccion: 'Felicita al alumno en una frase y llama a «hoy» para ver qué sigue.',
			});
		},
	);

	server.registerTool(
		'mi_progreso',
		{
			title: 'Mi progreso',
			description: 'Ejercicios hechos y pendientes del alumno, semana a semana.',
			annotations: readOnly,
		},
		async () => {
			if (access.kind !== 'student') {
				return reply({
					instruccion:
						'El progreso solo se guarda con un enlace personal. Dile al alumno que se lo pida a su formador o a su responsable de equipo.',
				});
			}
			const course = content.courses[access.cohort.course];
			const completed = await done();
			return reply({
				curso: access.cohort.course,
				semanas: course.weeks.map((w, i) => ({
					semana: i + 1,
					titulo: w.title,
					hechos: w.exercises.filter((e) => completed.includes(e.id)).map((e) => e.title),
					pendientes: w.exercises.filter((e) => !completed.includes(e.id)).map((e) => e.title),
				})),
				instruccion: 'Resume el progreso en dos frases y anima al alumno a seguir con lo siguiente.',
			});
		},
	);

	server.registerResource(
		'reglas-de-uso',
		'curso://reglas',
		{ title: 'Reglas de uso de la IA', description: 'Las reglas que el curso aplica en cada ejercicio.', mimeType: 'text/markdown' },
		async (uri) => ({
			contents: [{ uri: uri.href, text: content.rules.map((r) => `## ${r.title}\n\n${r.body}`).join('\n\n') }],
		}),
	);

	server.registerResource(
		'glosario',
		'curso://glosario',
		{ title: 'Glosario del curso', mimeType: 'text/markdown' },
		async (uri) => ({
			contents: [{ uri: uri.href, text: content.glossary.map((c) => `## ${c.term}\n\n${c.explanation}`).join('\n\n') }],
		}),
	);

	server.registerResource(
		'curso',
		new ResourceTemplate('curso://cursos/{slug}', {
			list: async () => ({
				resources: Object.entries(content.courses).map(([slug, c]) => ({ uri: `curso://cursos/${slug}`, name: c.title })),
			}),
		}),
		{ title: 'Programa de un curso', mimeType: 'text/markdown' },
		async (uri, { slug }) => {
			const course = content.courses[String(slug)];
			if (!course) throw new Error(`No existe el curso «${slug}».`);
			const weeks = course.weeks.map((w, i) => `## Semana ${i + 1}: ${w.title}\n\n${w.goal}\n\nResultado: ${w.outcome}`);
			return { contents: [{ uri: uri.href, text: [`# ${course.title}`, course.lead, ...weeks].join('\n\n') }] };
		},
	);

	const prompt = (text: string) => async () => ({ messages: [{ role: 'user' as const, content: { type: 'text' as const, text } }] });
	server.registerPrompt(
		'empezar-sesion',
		{ title: 'Empezar la sesión', description: 'Qué toca hoy en el curso.' },
		prompt('Vamos a seguir con el curso. ¿Qué me toca hoy?'),
	);
	server.registerPrompt(
		'revisar-mi-entrega',
		{ title: 'Revisar mi entrega', description: 'Revisar la entrega de la semana con los criterios del curso.' },
		prompt('Quiero revisar mi entrega de esta semana con los criterios del curso.'),
	);
	server.registerPrompt(
		'me-he-atascado',
		{ title: 'Me he atascado', description: 'Ayuda con el ejercicio en curso.' },
		prompt('Me he atascado con el ejercicio de hoy. ¿Me ayudas a seguir sin hacerlo por mí?'),
	);

	return server;
}
