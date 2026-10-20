import type { FaqItem, Metric, Phase, RolePath, TitledItem } from './types';

export const rolePaths: RolePath[] = [
	{ role: 'Toda la organización', core: ['00', '01', '02', '06'], optional: [] },
	{ role: 'Equipos operativos y de análisis', core: ['03'], optional: ['04'] },
	{ role: 'Responsables de proceso', core: ['03', '04'], optional: ['05'] },
	{ role: 'Equipos técnicos', core: ['04', '05'], optional: [] },
	{ role: 'Cumplimiento, legal y seguridad', core: ['06'], optional: ['07'] },
	{ role: 'Dirección y mandos', core: ['07'], optional: ['03'] },
];

export const phases: Phase[] = [
	{
		step: 'Fase 1 · Diagnóstico',
		title: 'Punto de partida',
		summary: 'Entrevistas cortas con dirección y áreas clave sobre herramientas, usos actuales y restricciones.',
		deliverable: 'Mapa de uso y riesgos',
	},
	{
		step: 'Fase 2 · Sesión inicial',
		title: 'Base común',
		summary: 'La sesión de 90 minutos, con ejemplos tomados del diagnóstico.',
		deliverable: 'Materiales y guía de uso inicial',
	},
	{
		step: 'Fase 3 · Módulos',
		title: 'Profundización por rol',
		summary: 'Grupos reducidos, con ejercicios sobre el trabajo real de cada área.',
		deliverable: 'Casos de uso documentados',
	},
	{
		step: 'Fase 4 · Medición',
		title: 'Revisión de resultados',
		summary: 'Adopción, calidad y tiempo, comparados con lo acordado al inicio.',
		deliverable: 'Informe y recomendaciones',
	},
];

export const metrics: Metric[] = [
	{
		dimension: 'Adopción',
		measured: 'Quién usa las herramientas aprobadas, con qué frecuencia y para qué tareas.',
		received: 'Uso por área, antes y después.',
	},
	{
		dimension: 'Calidad',
		measured: 'Resultados revisados con una rúbrica común sobre tareas reales del equipo.',
		received: 'Puntuación por tarea y ejemplos comentados.',
	},
	{
		dimension: 'Tiempo',
		measured: 'Duración de tareas seleccionadas con y sin IA.',
		received: 'Estimación de horas liberadas por área.',
	},
	{
		dimension: 'Riesgo',
		measured: 'Cumplimiento de la política de uso y casos de datos sensibles.',
		received: 'Incidencias detectadas y recomendaciones.',
	},
];

export const dataHandling: TitledItem[] = [
	{ title: 'Confidencialidad.', body: 'Acuerdo de confidencialidad antes del diagnóstico.' },
	{ title: 'Herramientas aprobadas.', body: 'Los ejercicios se hacen solo en herramientas autorizadas por la organización.' },
	{ title: 'Datos anonimizados.', body: 'La información sensible se sustituye por versiones de ejemplo.' },
];

export const regulation: TitledItem[] = [
	{
		title: 'Unión Europea.',
		body: 'El artículo 4 del Reglamento de IA exige a las organizaciones asegurar un nivel suficiente de alfabetización en IA de su personal.',
	},
	{ title: 'Latinoamérica.', body: 'El contenido se alinea con la normativa de protección de datos de cada país.' },
	{ title: 'Política interna.', body: 'El módulo 06 incluye un borrador de política de uso de IA para revisión del área legal.' },
];

export const principles: TitledItem[] = [
	{
		title: 'Independencia',
		body: 'Sin acuerdos comerciales con fabricantes de IA. Se enseña con las herramientas que cada organización ya usa.',
	},
	{ title: 'Trabajo real', body: 'Los ejercicios parten de documentos, procesos y decisiones del propio equipo.' },
	{ title: 'Criterio', body: 'Saber cuándo no usar la IA es tan importante como saber usarla.' },
	{ title: 'Medición', body: 'Lo que se va a medir se acuerda antes de empezar.' },
];

export const faq: FaqItem[] = [
	{
		question: 'Compramos licencias de Copilot (o ChatGPT) y casi nadie las usa.',
		answer:
			'Es el caso más común. El diagnóstico identifica por qué no se usan y los módulos 02 y 03 se imparten directamente sobre esa herramienta y las tareas de cada área.',
	},
	{
		question: 'Al equipo le preocupa que la IA sustituya su trabajo.',
		answer:
			'La sesión inicial aborda el tema de forma directa: qué tareas cambian, cuáles no y qué criterio sigue siendo humano. El programa se centra en ampliar el trabajo de cada persona, no en reemplazarlo.',
	},
	{
		question: 'No podemos permitir errores en procesos críticos.',
		answer:
			'Cada módulo enseña a verificar resultados y a decidir cuándo no usar IA. Los procesos críticos se tratan con supervisión humana obligatoria.',
	},
	{
		question: '¿Cómo sabremos si funcionó?',
		answer: 'Con las métricas acordadas en el diagnóstico, medidas antes y después del programa.',
	},
	{
		question: '¿Trabajan con una herramienta concreta?',
		answer:
			'El programa es neutral. Cuando la organización ya tiene una herramienta (Microsoft Copilot, ChatGPT Enterprise, Gemini o Claude), los ejercicios se hacen en ella.',
	},
];

export const openCourses: TitledItem[] = [
	{
		title: 'Contenido validado a escala.',
		body: 'Los cursos abiertos ponen a prueba el material con perfiles muy distintos antes de llevarlo a una organización.',
	},
	{
		title: 'Incorporaciones.',
		body: 'Las personas que se suman a un equipo ya formado pueden completar los módulos en una cohorte abierta.',
	},
	{
		title: 'Un mismo lenguaje.',
		body: 'Lo que aprende una persona por su cuenta coincide con lo que aprende su equipo en la empresa.',
	},
];
