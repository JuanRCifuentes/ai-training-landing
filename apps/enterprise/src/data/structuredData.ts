import { site } from '../config/site';
import { routes } from '../config/routes';
import { programme } from './modules';
import type { Link, Module } from './types';

const organizationId = (url: string) => `${url}#organization`;

function provider(siteUrl?: URL) {
	return siteUrl ? { '@id': organizationId(siteUrl.href) } : { '@type': 'Organization', name: site.name };
}

function course(module: Module, siteUrl?: URL) {
	return {
		'@type': 'Course',
		name: module.title,
		description: module.summary,
		url: siteUrl ? new URL(routes.module(module.slug), siteUrl).href : undefined,
		inLanguage: site.lang,
		educationalLevel: module.level,
		audience: { '@type': 'Audience', audienceType: module.audience },
		teaches: module.objectives,
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
		areaServed: ['ES', 'CO', 'Latinoamérica', 'Europa'],
		sameAs: [site.peopleSiteUrl],
		address: site.offices.map((office) => ({
			'@type': 'PostalAddress',
			addressLocality: office.city,
			addressCountry: office.country,
		})),
	};

	return {
		'@graph': [
			organization,
			{
				'@type': 'ItemList',
				name: 'Módulos del programa',
				itemListElement: programme.map((module, position) => ({
					'@type': 'ListItem',
					position: position + 1,
					item: course(module, siteUrl),
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

/** schema.org graph for a module page. */
export function moduleStructuredData(module: Module, trail: Link[], siteUrl?: URL) {
	return { '@graph': [course(module, siteUrl), breadcrumbList(trail, module.title, siteUrl)] };
}

/** schema.org graph for a plain content page, such as a legal document. */
export function pageStructuredData(title: string, trail: Link[], siteUrl?: URL) {
	return { '@graph': [{ '@type': 'WebPage', name: title }, breadcrumbList(trail, title, siteUrl)] };
}
