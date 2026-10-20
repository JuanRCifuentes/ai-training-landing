import type { Course } from './types';

export const courses: Course[] = [
	{
		ref: '01',
		title: 'Fundamentos de IA',
		summary: 'Cómo piensan los modelos, por qué se equivocan y cuándo no confiar en ellos.',
		level: 'básico',
		outcome: 'tu mapa de usos y límites',
	},
	{
		ref: '02',
		title: 'Instrucciones y contexto',
		summary: 'Escribir instrucciones que funcionan y darle a la IA el contexto correcto.',
		level: 'básico',
		outcome: 'tu biblioteca de instrucciones',
	},
	{
		ref: '03',
		title: 'IA para el día a día',
		summary: 'Correo, documentos, reuniones, datos e investigación, con tus propias tareas.',
		level: 'práctico',
		outcome: '5 flujos de trabajo reales',
	},
	{
		ref: '04',
		title: 'Tus propios asistentes',
		summary: 'Asistentes con tus instrucciones y documentos para lo que haces siempre.',
		level: 'práctico',
		outcome: 'tu primer asistente',
	},
	{
		ref: '05',
		title: 'Agentes y automatización',
		summary: 'Flujos que conectan la IA con tus apps para completar tareas de varios pasos.',
		level: 'avanzado',
		outcome: 'un agente que trabaja por ti',
	},
	{
		ref: '06',
		title: 'IA responsable',
		summary: 'Privacidad, sesgos y cómo verificar antes de confiar en una respuesta.',
		level: 'para todos',
		outcome: 'tu checklist de verificación',
	},
];
