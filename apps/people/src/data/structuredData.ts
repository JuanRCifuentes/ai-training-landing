import { site } from '../config/site';
import { routes } from '../config/routes';
import { courses } from './courses';
import type { Profession } from './professions';
import type { Course, Link } from './types';

const organizationId = (url: string) => `${url}#organization`;

function provider(siteUrl?: URL) {
	return siteUrl ? { '@id': organizationId(siteUrl.href) } : { '@type': 'Organization', name: site.name };
}

interface CourseFields {
	name: string;
	description: string;
	/** Path of the page that describes the course. */
	path: string;
	level: string;
	audience: string;
	teaches: string[];
}

function course({ name, description, path, level, audience, teaches }: CourseFields, siteUrl?: URL) {
	return {
		'@type': 'Course',
		name,
		description,
		url: siteUrl ? new URL(path, siteUrl).href : undefined,
		inLanguage: site.lang,
		educationalLevel: level,
		audience: { '@type': 'Audience', audienceType: audience },
		teaches,
		provider: provider(siteUrl),
	};
}

/** schema.org Course fields of a course. */
function courseFields(item: Course): CourseFields {
	return {
		name: item.title,
		description: item.summary,
		path: routes.course(item.slug),
		level: item.level,
		audience: item.audience,
		teaches: item.topics,
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
					item: course(courseFields(item), siteUrl),
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
	return { '@graph': [course(courseFields(item), siteUrl), breadcrumbList(trail, item.title, siteUrl)] };
}

/** schema.org graph for a profession page. */
export function professionStructuredData(profession: Profession, trail: Link[], siteUrl?: URL) {
	const { name, title, description, audience, tasks } = profession.data;
	const fields = {
		name: title,
		description,
		path: routes.profession(profession.id),
		level: 'Inicial',
		audience,
		teaches: tasks.map((task) => task.title),
	};
	return { '@graph': [course(fields, siteUrl), breadcrumbList(trail, name, siteUrl)] };
}

/** schema.org graph for a plain content page, such as a legal document. */
export function pageStructuredData(title: string, trail: Link[], siteUrl?: URL) {
	return { '@graph': [{ '@type': 'WebPage', name: title }, breadcrumbList(trail, title, siteUrl)] };
}
