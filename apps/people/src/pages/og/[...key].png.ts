import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { courseLabel, courses } from '../../data/courses';
import { renderShareImage, type ShareCard } from '../../lib/shareImage';
import { routes } from '../../config/routes';

// One image per page, keyed by the page's path so Seo finds it without being told.
export const getStaticPaths = (async () => {
	const legal = await getCollection('legal');
	const cards: { path: string; card: ShareCard }[] = [
		{ path: routes.home, card: { kicker: 'cursos de IA', title: 'Deja de probar la IA. Aprende a usarla.' } },
		...courses.map((course) => ({
			path: routes.course(course.slug),
			card: { kicker: courseLabel(course), title: course.title },
		})),
		...legal.map((document) => ({
			path: routes.legal(document.id),
			card: { kicker: 'legal', title: document.data.title },
		})),
	];
	return cards.map(({ path, card }) => ({ params: { key: routes.shareImageKey(path) }, props: card }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<ShareCard> = async ({ props }) =>
	new Response(await renderShareImage(props), { headers: { 'Content-Type': 'image/png' } });
