import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { markCells, markCursor } from '../config/brand';
import { site } from '../config/site';

export interface ShareCard {
	/** Short code-comment style line above the title, e.g. "curso 03 · práctico". */
	kicker: string;
	title: string;
}

export const shareImageSize = { width: 1200, height: 630 };

// Colours from tokens.css; share images always use the terminal look so they stand out in chat apps.
const colors = { bg: '#0f0f12', ink: '#f2f2f4', muted: '#8b8b94', accent: '#a68bff', pop: '#c6f432', line: '#22222a' };

const require = createRequire(import.meta.url);
const font = (file: string) => readFile(require.resolve(`@fontsource/${file}`));

let fonts: Promise<Parameters<typeof satori>[1]['fonts']> | undefined;
function loadFonts() {
	fonts ??= Promise.all([
		font('space-grotesk/files/space-grotesk-latin-700-normal.woff'),
		font('jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff'),
	]).then(([sans, mono]) => [
		{ name: 'Sans', data: sans, weight: 700 as const },
		{ name: 'Mono', data: mono, weight: 400 as const },
	]);
	return fonts;
}

// Minimal element factory for satori, which takes React-like nodes.
type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
	type,
	props: { style, children, ...extra },
});

const { x, y, width, height } = markCursor;
const markSvg = `data:image/svg+xml,${encodeURIComponent(
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${markCells
		.map(([cx, cy]) => `<rect x="${cx}" y="${cy}" width="6" height="6" rx="1.5" fill="${colors.accent}"/>`)
		.join('')}<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="2" fill="${colors.pop}"/></svg>`,
)}`;

/**
 * Renders the 1200×630 PNG used by WhatsApp, LinkedIn, X and other link previews.
 * Everything is centred so the card still reads when an app crops it to a square.
 */
export async function renderShareImage({ kicker, title }: ShareCard): Promise<Uint8Array> {
	const titleSize = title.length > 40 ? 66 : 84;
	const tree = h(
		'div',
		{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			// Satori sizes boxes as content-box, so padding is subtracted here.
			width: shareImageSize.width - 160,
			height: shareImageSize.height - 52 - 44,
			padding: '52px 80px 44px',
			background: colors.bg,
			fontFamily: 'Sans',
			color: colors.ink,
			textAlign: 'center',
		},
		[
			h('div', { display: 'flex', alignItems: 'center', gap: 18 }, [
				h('img', {}, undefined, { src: markSvg, width: 64, height: 64 }),
				h('div', { fontSize: 34, letterSpacing: -0.5 }, site.name),
			]),
			h('div', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: 26 }, [
				h('div', { fontFamily: 'Mono', fontSize: 28, color: colors.pop }, `// ${kicker}`),
				h('div', { fontSize: titleSize, lineHeight: 1.04, letterSpacing: -2, maxWidth: 980 }, title),
			]),
			h(
				'div',
				{
					display: 'flex',
					justifyContent: 'center',
					width: '100%',
					paddingTop: 20,
					borderTop: `1px solid ${colors.line}`,
					fontFamily: 'Mono',
					fontSize: 22,
					color: colors.muted,
				},
				[...site.cities, 'en línea'].join(' · '),
			),
		],
	);

	const svg = await satori(tree as Parameters<typeof satori>[0], { ...shareImageSize, fonts: await loadFonts() });
	return new Resvg(svg).render().asPng();
}
