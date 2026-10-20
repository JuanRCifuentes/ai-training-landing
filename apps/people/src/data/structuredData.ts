import { site } from '../config/site';
import { courses } from './courses';

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
		sameAs: [site.enterpriseSiteUrl],
	};

	const courseList = courses.map((course, position) => ({
		'@type': 'ListItem',
		position: position + 1,
		item: {
			'@type': 'Course',
			name: course.title,
			description: course.summary,
			inLanguage: site.lang,
			educationalLevel: course.level,
			provider: url ? { '@id': `${url}#organization` } : { '@type': 'Organization', name: site.name },
		},
	}));

	return {
		'@graph': [organization, { '@type': 'ItemList', name: 'Cursos', itemListElement: courseList }],
	};
}
