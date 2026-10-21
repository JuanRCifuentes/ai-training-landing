import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { moduleLabel, programme } from '../../data/modules';
import { getProfessions, professionLabel } from '../../data/professions';
import { renderShareImage, type ShareCard } from '../../lib/shareImage';
import { routes } from '../../config/routes';
import { site } from '../../config/site';

// One image per page, keyed by the page's path so Seo finds it without being told.
export const getStaticPaths = (async () => {
	const legal = await getCollection('legal');
	const professions = await getProfessions();
	const cards: { path: string; card: ShareCard }[] = [
		{ path: routes.home, card: { eyebrow: 'Programa de formación', title: 'Formación en inteligencia artificial para el trabajo' } },
		...programme.map((module) => ({
			path: routes.module(module.slug),
			card: { eyebrow: moduleLabel(module), title: module.title },
		})),
		...professions.map((profession) => ({
			path: routes.profession(profession.id),
			card: { eyebrow: professionLabel(profession), title: profession.data.title },
		})),
		...legal.map((document) => ({
			path: routes.legal(document.id),
			card: { eyebrow: site.name, title: document.data.title },
		})),
	];
	return cards.map(({ path, card }) => ({ params: { key: routes.shareImageKey(path) }, props: card }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<ShareCard> = async ({ props }) =>
	new Response(await renderShareImage(props), { headers: { 'Content-Type': 'image/png' } });
