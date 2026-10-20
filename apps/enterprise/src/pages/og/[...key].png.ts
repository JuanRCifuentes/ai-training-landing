import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { programme } from '../../data/modules';
import { renderShareImage, type ShareCard } from '../../lib/shareImage';
import { site } from '../../config/site';

export const getStaticPaths = (async () => {
	const legal = await getCollection('legal');
	const cards: { key: string; card: ShareCard }[] = [
		{ key: 'home', card: { eyebrow: 'Programa de formación', title: 'Formación en inteligencia artificial para el trabajo' } },
		...programme.map((module) => ({
			key: `modules/${module.slug}`,
			card: { eyebrow: `Módulo ${module.ref} · ${module.level}`, title: module.title },
		})),
		...legal.map((document) => ({
			key: `legal/${document.id}`,
			card: { eyebrow: site.name, title: document.data.title },
		})),
	];
	return cards.map(({ key, card }) => ({ params: { key }, props: card }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<ShareCard> = async ({ props }) =>
	new Response(await renderShareImage(props), { headers: { 'Content-Type': 'image/png' } });
