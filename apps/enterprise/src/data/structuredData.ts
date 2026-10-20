import { site } from '../config/site';
import { introSession, modules } from './modules';

/** schema.org graph for the home page: the organization and its courses. */
export function homeStructuredData(siteUrl?: URL) {
	const url = siteUrl?.href;
	const organization = {
		'@type': 'EducationalOrganization',
		'@id': url ? `${url}#organization` : undefined,
		name: site.name,
		description: site.description,
		url,
		logo: url ? new URL('/icon-512.png', url).href : undefined,
		email: site.contactEmail,
		areaServed: ['ES', 'CO', 'Latinoamérica', 'Europa'],
		address: site.offices.map((office) => ({
			'@type': 'PostalAddress',
			addressLocality: office.city,
			addressCountry: office.country,
		})),
	};

	const courses = [introSession, ...modules].map((module, position) => ({
		'@type': 'ListItem',
		position: position + 1,
		item: {
			'@type': 'Course',
			name: module.title,
			description: module.summary,
			inLanguage: site.lang,
			educationalLevel: module.level,
			audience: { '@type': 'Audience', audienceType: module.audience },
			provider: url ? { '@id': `${url}#organization` } : { '@type': 'Organization', name: site.name },
		},
	}));

	return {
		'@graph': [organization, { '@type': 'ItemList', name: 'Módulos del programa', itemListElement: courses }],
	};
}
