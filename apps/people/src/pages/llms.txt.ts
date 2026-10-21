import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { courses } from '../data/courses';
import { faq } from '../data/content';
import { getProfessions } from '../data/professions';
import { routes } from '../config/routes';
import { site } from '../config/site';

// The site as one Markdown file (llmstxt.org), so an AI assistant can answer
// "where can I learn to use AI at work" without crawling every page.
export const GET: APIRoute = async ({ site: origin }) => {
	const [professions, legal] = await Promise.all([getProfessions(), getCollection('legal')]);
	const link = (path: string) => new URL(path, origin).href;
	const body = [
		`# ${site.name}`,
		'',
		`> ${site.description}`,
		'',
		`Cursos en ${site.cities.join(' y ')} y en línea. Para organizaciones hay un programa aparte: ${site.enterpriseSiteUrl}. Contacto: ${site.contactEmail}.`,
		'',
		'## Cursos',
		'',
		...courses.map((course) => `- [${course.title}](${link(routes.course(course.slug))}): ${course.summary} Nivel ${course.level}.`),
		'',
		'## IA aplicada por profesión',
		'',
		...professions.map((profession) => `- [${profession.data.title}](${link(routes.profession(profession.id))}): ${profession.data.summary}`),
		'',
		'## Preguntas frecuentes',
		'',
		...faq.map((item) => `- ${item.question} ${item.answer}`),
		'',
		'## Legal',
		'',
		...legal.sort((a, b) => a.data.order - b.data.order).map((document) => `- [${document.data.title}](${link(routes.legal(document.id))})`),
		'',
	].join('\n');
	return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
