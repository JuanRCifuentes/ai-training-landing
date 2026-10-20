import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { courses } from '../../data/courses';
import { renderShareImage, type ShareCard } from '../../lib/shareImage';

export const getStaticPaths = (async () => {
	const legal = await getCollection('legal');
	const cards: { key: string; card: ShareCard }[] = [
		{ key: 'home', card: { kicker: 'cursos de IA', title: 'Deja de probar la IA. Aprende a usarla.' } },
		...courses.map((course) => ({
			key: `courses/${course.slug}`,
			card: { kicker: `curso ${course.ref} · ${course.level}`, title: course.title },
		})),
		...legal.map((document) => ({
			key: `legal/${document.id}`,
			card: { kicker: 'legal', title: document.data.title },
		})),
	];
	return cards.map(({ key, card }) => ({ params: { key }, props: card }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<ShareCard> = async ({ props }) =>
	new Response(await renderShareImage(props), { headers: { 'Content-Type': 'image/png' } });
