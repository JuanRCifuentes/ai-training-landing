import { routes } from './routes';

export const site = {
	name: 'AI en el trabajo',
	title: 'AI en el trabajo · Cursos de IA para personas',
	description:
		'Cursos prácticos de inteligencia artificial en español: instrucciones, asistentes propios, agentes y automatización.',
	tagline: 'Cursos de inteligencia artificial para personas',
	locale: 'es_ES',
	lang: 'es',
	themeColor: '#5b2ee6',
	/** Browser UI colour in dark mode; matches the dark page background. */
	themeColorDark: '#0c0c0f',
	// TODO: replace with the real contact address before launch.
	contactEmail: 'contacto@example.com',
	/**
	 * Endpoint of the waitlist provider. While it is undefined, the waitlist
	 * falls back to a mailto link to contactEmail.
	 */
	waitlistFormAction: undefined as string | undefined,
	enterpriseSiteUrl: 'https://ai-training-enterprise.juan-r-cifuentes.workers.dev',
	cities: ['Bogotá', 'Madrid'],
} as const;

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

/** Call to action repeated across the site; every instance points at the waitlist section. */
export const waitlistCta = { href: routes.section('waitlist'), label: 'Únete a la lista' } as const;

/** Home page sections in the main navigation; `section` is the id of the section element. */
export const nav = [
	{ section: 'courses', label: 'Cursos' },
	{ section: 'professions', label: 'Por profesión' },
	{ section: 'free-talk', label: 'Charla gratis' },
	{ section: 'how-it-works', label: 'Cómo funciona' },
	{ section: 'faq', label: 'Preguntas' },
] as const;
