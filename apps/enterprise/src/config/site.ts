export const site = {
	name: 'AI en el trabajo',
	title: 'AI en el trabajo · Formación en IA para organizaciones',
	description:
		'Programa de formación en inteligencia artificial para organizaciones. Método, criterio y gobierno para equipos directivos y operativos. Bogotá y Madrid.',
	tagline: 'Formación en inteligencia artificial para organizaciones',
	locale: 'es_ES',
	lang: 'es',
	themeColor: '#14336e',
	/** Browser UI colour in dark mode; matches the dark page background. */
	themeColorDark: '#0a111c',
	// TODO: replace with the real contact address before launch.
	contactEmail: 'contacto@example.com',
	peopleSiteUrl: 'https://ai-training-people.juan-r-cifuentes.workers.dev',
	offices: [
		{ city: 'Bogotá', country: 'Colombia', scope: 'Atención a Latinoamérica' },
		{ city: 'Madrid', country: 'España', scope: 'Atención a España y Europa' },
	],
} as const;

export const cities = site.offices.map((office) => office.city);

/**
 * Legal owner of the site, shown on the legal notice and the privacy policy.
 * TODO: replace the bracketed values with the company's registered details before launch.
 */
export const owner = {
	name: '[Razón social]',
	taxId: '[NIF]',
	address: '[Domicilio social]',
	registry: '[Datos de inscripción en el Registro Mercantil]',
	email: site.contactEmail,
} as const;

export const nav = [
	{ href: '/#modules', label: 'Módulos', priority: 'always' },
	{ href: '/#roles', label: 'Rutas por rol', priority: 'medium' },
	{ href: '/#methodology', label: 'Metodología', priority: 'low' },
	{ href: '/#responsible-use', label: 'Uso responsable', priority: 'low' },
	{ href: '/#about', label: 'Acerca de', priority: 'medium' },
	{ href: '/#contact', label: 'Contacto', priority: 'always' },
] as const;
