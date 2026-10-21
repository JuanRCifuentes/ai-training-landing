import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { moduleLabel, programme } from '../data/modules';
import { faq, phases, programFacts } from '../data/program';
import { getProfessions } from '../data/professions';
import { routes } from '../config/routes';
import { site } from '../config/site';

// The site as one Markdown file (llmstxt.org), so an AI assistant can answer
// "who trains companies in AI in Bogotá or Madrid" without crawling every page.
export const GET: APIRoute = async ({ site: origin }) => {
	const [professions, legal] = await Promise.all([getProfessions(), getCollection('legal')]);
	const link = (path: string) => new URL(path, origin).href;
	const body = [
		`# ${site.name}`,
		'',
		`> ${site.description}`,
		'',
		...site.offices.map((office) => `- ${office.city} (${office.country}): ${office.scope}.`),
		'',
		...programFacts.map((fact) => `${fact.term}: ${fact.value}.`),
		'',
		`Contacto: ${site.contactEmail}. Cursos abiertos para personas: ${site.peopleSiteUrl}.`,
		'',
		'## Módulos del programa',
		'',
		...programme.map((module) => `- [${module.title}](${link(routes.module(module.slug))}) (${moduleLabel(module)}): ${module.summary}`),
		'',
		'## Cómo se implanta',
		'',
		...phases.map((phase) => `- ${phase.step}: ${phase.summary} Entregable: ${phase.deliverable}.`),
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
