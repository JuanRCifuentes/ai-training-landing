import type { Module } from './types';

export const introSession: Module = {
	ref: '00',
	title: 'AI en el trabajo',
	summary:
		'Panorama de la IA generativa: qué es, dónde aporta valor, dónde falla y qué reglas necesita una organización para usarla. Incluye demostraciones sobre tareas habituales y una introducción a cada módulo del programa.',
	level: 'Introductorio',
	audience: 'Toda la organización',
	duration: '90 minutos',
	prerequisites: 'Ninguno',
};

export const modules: Module[] = [
	{
		ref: '01',
		title: 'Fundamentos de IA',
		summary: 'Cómo funcionan los modelos de lenguaje, qué pueden y qué no pueden hacer, y por qué se equivocan.',
		level: 'Introductorio',
		audience: 'Todos los roles',
	},
	{
		ref: '02',
		title: 'Instrucciones y contexto',
		summary: 'Cómo formular una petición, qué contexto aportar y cómo obtener resultados consistentes y verificables.',
		level: 'Introductorio',
		audience: 'Todos los roles',
	},
	{
		ref: '03',
		title: 'IA en el trabajo diario',
		summary: 'Documentos, análisis, investigación y comunicación con IA, sobre casos del propio equipo.',
		level: 'Intermedio',
		audience: 'Equipos operativos y de análisis',
	},
	{
		ref: '04',
		title: 'Asistentes propios',
		summary: 'Diseño de asistentes con instrucciones y conocimiento interno para tareas recurrentes.',
		level: 'Intermedio',
		audience: 'Responsables de proceso',
	},
	{
		ref: '05',
		title: 'Agentes y automatización',
		summary: 'Flujos de varios pasos que conectan la IA con los sistemas de la organización, con supervisión humana.',
		level: 'Avanzado',
		audience: 'Equipos técnicos y de operaciones',
	},
	{
		ref: '06',
		title: 'Uso responsable de la IA',
		summary: 'Privacidad, confidencialidad, sesgos, verificación de resultados y política interna de uso.',
		level: 'Transversal',
		audience: 'Todos los roles, cumplimiento y legal',
	},
	{
		ref: '07',
		title: 'Adopción en equipos',
		summary: 'Priorización de casos de uso, acuerdos de trabajo, medición y gestión del cambio.',
		level: 'Dirección',
		audience: 'Dirección y mandos intermedios',
	},
];
