import { site } from '../config/site';
import type { FaqItem, Shift, TitledItem } from './types';

export const tools = ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'n8n', 'Make', 'Asistentes propios', 'Agentes'];

export const backingPoints = [
	'Probado con equipos reales, sobre su trabajo real',
	'Con criterio sobre datos y privacidad, como lo exige una empresa',
	'Lo que aprendes es lo que tu empresa va a pedir mañana',
];

export const shifts: Shift[] = [
	{ from: '"hazme un resumen"', to: 'Instrucciones que dan el mismo buen resultado cada vez' },
	{ from: 'repetir lo mismo cada lunes', to: 'Un asistente propio que ya conoce tu trabajo' },
	{ from: 'pasar datos a mano', to: 'Un agente que mueve la información entre tus herramientas' },
];

export const freeTalkFacts = ['en vivo y en línea', '90 minutos', 'sin conocimientos previos'];

export const howItWorks: TitledItem[] = [
	{ title: 'Sesiones en vivo', body: 'Online, con instructor y espacio para preguntar.' },
	{ title: 'Grupos pequeños', body: 'Cohortes reducidas para que nadie se quede atrás.' },
	{ title: 'Tu propio trabajo', body: 'Los ejercicios son tus tareas, no ejemplos de libro.' },
	{ title: 'Algo que te llevas', body: 'Cada curso termina con algo que ya funciona.' },
];

export const faq: FaqItem[] = [
	{
		question: '¿Necesito saber programar?',
		answer:
			'No. Solo el curso de agentes asume que te mueves cómodo con herramientas digitales, y aun así no se programa.',
	},
	{
		question: '¿Qué herramienta de IA necesito?',
		answer:
			'La que ya usas. Las técnicas sirven en ChatGPT, Claude, Gemini o Copilot, y las versiones gratuitas alcanzan para empezar.',
	},
	{
		question: '¿Cuánto cuestan los cursos?',
		answer: 'Publicaremos precios con la primera cohorte. Quienes estén en la lista lo sabrán primero.',
	},
	{
		question: '¿Y si mi empresa quiere formar a todo el equipo?',
		answer: 'Tenemos un programa para organizaciones.',
		link: { href: site.enterpriseSiteUrl, label: 'Ver formación para empresas' },
	},
];
