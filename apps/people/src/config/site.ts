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

/** Call to action repeated across the page; every instance points at the waitlist section. */
export const waitlistCta = { href: '#waitlist', label: 'Únete a la lista' } as const;

export const nav = [
	{ href: '#courses', label: 'Cursos' },
	{ href: '#free-talk', label: 'Charla gratis' },
	{ href: '#how-it-works', label: 'Cómo funciona' },
	{ href: '#faq', label: 'Preguntas' },
] as const;
