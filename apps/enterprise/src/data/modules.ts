import type { Module } from './types';

export const introSession: Module = {
	ref: '00',
	slug: 'sesion-inicial',
	title: 'AI en el trabajo',
	summary:
		'Panorama de la IA generativa: qué es, dónde aporta valor, dónde falla y qué reglas necesita una organización para usarla. Incluye demostraciones sobre tareas habituales y una introducción a cada módulo del programa.',
	level: 'Introductorio',
	audience: 'Toda la organización',
	duration: '90 minutos',
	prerequisites: 'Ninguno',
	objectives: [
		'Entender qué es la IA generativa y qué cambia en el trabajo diario.',
		'Reconocer las tareas donde aporta valor y aquellas donde no conviene usarla.',
		'Conocer las reglas básicas de uso que aplican en la organización.',
	],
	topics: [
		'Qué es y qué no es la IA generativa',
		'Demostraciones sobre tareas habituales de la organización',
		'Errores frecuentes y cómo detectarlos',
		'Datos, confidencialidad y herramientas aprobadas',
		'Mapa del programa y rutas por rol',
	],
};

export const modules: Module[] = [
	{
		ref: '01',
		slug: 'fundamentos-de-ia',
		title: 'Fundamentos de IA',
		summary: 'Cómo funcionan los modelos de lenguaje, qué pueden y qué no pueden hacer, y por qué se equivocan.',
		level: 'Introductorio',
		audience: 'Todos los roles',
		objectives: [
			'Explicar en términos sencillos cómo genera respuestas un modelo de lenguaje.',
			'Anticipar los tipos de error más habituales antes de que ocurran.',
			'Elegir el tipo de herramienta adecuado para cada tarea.',
		],
		topics: [
			'Modelos de lenguaje: entrenamiento, predicción y contexto',
			'Alucinaciones, sesgos y límites de conocimiento',
			'Modelos generalistas, asistentes y herramientas integradas',
			'Privacidad: qué ocurre con los datos que se introducen',
		],
	},
	{
		ref: '02',
		slug: 'instrucciones-y-contexto',
		title: 'Instrucciones y contexto',
		summary: 'Cómo formular una petición, qué contexto aportar y cómo obtener resultados consistentes y verificables.',
		level: 'Introductorio',
		audience: 'Todos los roles',
		objectives: [
			'Redactar instrucciones con rol, contexto, tarea y formato definidos.',
			'Aportar documentos y ejemplos para mejorar la calidad del resultado.',
			'Revisar y corregir una respuesta de forma sistemática.',
		],
		topics: [
			'Anatomía de una buena instrucción',
			'Contexto: documentos, ejemplos y restricciones',
			'Iteración y corrección de resultados',
			'Plantillas de instrucciones para el equipo',
			'Verificación de datos, cifras y fuentes',
		],
	},
	{
		ref: '03',
		slug: 'ia-en-el-trabajo-diario',
		title: 'IA en el trabajo diario',
		summary: 'Documentos, análisis, investigación y comunicación con IA, sobre casos del propio equipo.',
		level: 'Intermedio',
		audience: 'Equipos operativos y de análisis',
		prerequisites: 'Módulos 01 y 02',
		objectives: [
			'Aplicar la IA a las tareas recurrentes del propio puesto.',
			'Combinar IA y criterio profesional en análisis e informes.',
			'Documentar los casos de uso que funcionan para compartirlos con el equipo.',
		],
		topics: [
			'Redacción y revisión de documentos y correos',
			'Resumen de reuniones, actas y seguimiento de acuerdos',
			'Análisis de datos y hojas de cálculo',
			'Investigación y preparación de informes',
			'Biblioteca de casos de uso del equipo',
		],
	},
	{
		ref: '04',
		slug: 'asistentes-propios',
		title: 'Asistentes propios',
		summary: 'Diseño de asistentes con instrucciones y conocimiento interno para tareas recurrentes.',
		level: 'Intermedio',
		audience: 'Responsables de proceso',
		prerequisites: 'Módulos 01 a 03',
		objectives: [
			'Identificar tareas recurrentes que justifican un asistente propio.',
			'Diseñar, probar y documentar un asistente con conocimiento interno.',
			'Definir quién mantiene el asistente y cómo se mide su calidad.',
		],
		topics: [
			'Cuándo conviene un asistente y cuándo no',
			'Instrucciones de sistema y documentos de referencia',
			'Pruebas con casos reales y criterios de calidad',
			'Permisos, datos y mantenimiento',
		],
	},
	{
		ref: '05',
		slug: 'agentes-y-automatizacion',
		title: 'Agentes y automatización',
		summary: 'Flujos de varios pasos que conectan la IA con los sistemas de la organización, con supervisión humana.',
		level: 'Avanzado',
		audience: 'Equipos técnicos y de operaciones',
		prerequisites: 'Módulos 01 a 04',
		objectives: [
			'Diseñar un flujo de varios pasos con puntos de control humano.',
			'Conectar la IA con las herramientas y datos de la organización de forma segura.',
			'Evaluar el riesgo y el retorno de una automatización antes de desplegarla.',
		],
		topics: [
			'Qué es un agente y en qué se diferencia de un asistente',
			'Diseño de flujos: entradas, pasos, decisiones y salidas',
			'Integraciones con correo, documentos y sistemas internos',
			'Supervisión humana, registros y gestión de errores',
			'Piloto: del prototipo al uso en producción',
		],
	},
	{
		ref: '06',
		slug: 'uso-responsable-de-la-ia',
		title: 'Uso responsable de la IA',
		summary: 'Privacidad, confidencialidad, sesgos, verificación de resultados y política interna de uso.',
		level: 'Transversal',
		audience: 'Todos los roles, cumplimiento y legal',
		objectives: [
			'Aplicar criterios de confidencialidad y protección de datos al usar IA.',
			'Detectar sesgos y verificar resultados antes de usarlos.',
			'Contar con un borrador de política interna de uso para revisión legal.',
		],
		topics: [
			'Datos personales y confidenciales: qué nunca introducir',
			'Sesgos y verificación de resultados',
			'Propiedad intelectual y uso de contenidos generados',
			'Reglamento europeo de IA y normativa aplicable',
			'Borrador de política interna de uso',
		],
	},
	{
		ref: '07',
		slug: 'adopcion-en-equipos',
		title: 'Adopción en equipos',
		summary: 'Priorización de casos de uso, acuerdos de trabajo, medición y gestión del cambio.',
		level: 'Dirección',
		audience: 'Dirección y mandos intermedios',
		objectives: [
			'Priorizar casos de uso por impacto, riesgo y esfuerzo.',
			'Establecer acuerdos de trabajo con IA dentro de cada equipo.',
			'Medir la adopción y comunicar resultados a la dirección.',
		],
		topics: [
			'Mapa de casos de uso y priorización',
			'Acuerdos de trabajo y responsabilidades',
			'Gestión del cambio y resistencia',
			'Indicadores de adopción, calidad y tiempo',
		],
	},
];

/** Opening session followed by the modules, in programme order. */
export const programme: Module[] = [introSession, ...modules];

/** Short label shown above a module's title, e.g. "Módulo 03 · Intermedio". */
export function moduleLabel(module: Module) {
	return module === introSession ? `${module.ref} · Sesión inicial` : `Módulo ${module.ref} · ${module.level}`;
}
