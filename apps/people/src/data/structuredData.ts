import { site } from '../config/site';
import { routes } from '../config/routes';
import { courses } from './courses';
import type { Course, Link } from './types';

const organizationId = (url: string) => `${url}#organization`;

function provider(siteUrl?: URL) {
	return siteUrl ? { '@id': organizationId(siteUrl.href) } : { '@type': 'Organization', name: site.name };
}

function course(course: Course, siteUrl?: URL) {
	return {
		'@type': 'Course',
		name: course.title,
		description: course.summary,
		url: siteUrl ? new URL(routes.course(course.slug), siteUrl).href : undefined,
		inLanguage: site.lang,
		educationalLevel: course.level,
		audience: { '@type': 'Audience', audienceType: course.audience },
		teaches: course.topics,
		provider: provider(siteUrl),
	};
}

/** schema.org graph for the home page: the organization and its courses. */
export function homeStructuredData(siteUrl?: URL) {
	const url = siteUrl?.href;
	const organization = {
		'@type': 'EducationalOrganization',
		'@id': url ? organizationId(url) : undefined,
		name: site.name,
		description: site.description,
		url,
		logo: url ? new URL('/icon-512.png', url).href : undefined,
		email: site.contactEmail,
		sameAs: [site.enterpriseSiteUrl],
	};

	return {
		'@graph': [
			organization,
			{
				'@type': 'ItemList',
				name: 'Cursos',
				itemListElement: courses.map((item, position) => ({
					'@type': 'ListItem',
					position: position + 1,
					item: course(item, siteUrl),
				})),
			},
		],
	};
}

function breadcrumbList(trail: Link[], current: string, siteUrl?: URL) {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: [...trail, { label: current }].map((link, position) => ({
			'@type': 'ListItem',
			position: position + 1,
			name: link.label,
			item: 'href' in link && siteUrl ? new URL(link.href, siteUrl).href : undefined,
		})),
	};
}

/** schema.org graph for a course page. */
export function courseStructuredData(item: Course, trail: Link[], siteUrl?: URL) {
	return { '@graph': [course(item, siteUrl), breadcrumbList(trail, item.title, siteUrl)] };
}

/** schema.org graph for a plain content page, such as a legal document. */
export function pageStructuredData(title: string, trail: Link[], siteUrl?: URL) {
	return { '@graph': [{ '@type': 'WebPage', name: title }, breadcrumbList(trail, title, siteUrl)] };
}
