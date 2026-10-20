import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { markLetters } from '../config/brand';
import { cities, site } from '../config/site';

export interface ShareCard {
	/** Small uppercase line above the title, e.g. "Módulo 03 · Intermedio". */
	eyebrow: string;
	title: string;
}

export const shareImageSize = { width: 1200, height: 630 };

// Colours from tokens.css (light theme); share images are always light.
const colors = { bg: '#ffffff', ink: '#0b1626', muted: '#5a6576', accent: '#14336e', line: '#dde1e7' };

const require = createRequire(import.meta.url);
const font = (file: string) => readFile(require.resolve(`@fontsource/${file}`));

let fonts: Promise<Parameters<typeof satori>[1]['fonts']> | undefined;
function loadFonts() {
	fonts ??= Promise.all([
		font('ibm-plex-serif/files/ibm-plex-serif-latin-400-normal.woff'),
		font('ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff'),
	]).then(([serif, mono]) => [
		{ name: 'Serif', data: serif, weight: 400 as const },
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

const markSvg = `data:image/svg+xml,${encodeURIComponent(
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="${colors.accent}" d="${markLetters}"/><path d="M6 36.5H42" stroke="${colors.accent}" stroke-width="1.5"/><path d="M6 40H42" stroke="${colors.accent}" stroke-width="0.75"/></svg>`,
)}`;

/**
 * Renders the 1200×630 PNG used by WhatsApp, LinkedIn, X and other link previews.
 * Everything is centred so the card still reads when an app crops it to a square.
 */
export async function renderShareImage({ eyebrow, title }: ShareCard): Promise<Uint8Array> {
	const titleSize = title.length > 40 ? 60 : 74;
	const tree = h(
		'div',
		{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			// Satori sizes boxes as content-box, so padding and border are subtracted here.
			width: shareImageSize.width - 160,
			height: shareImageSize.height - 48 - 40 - 14,
			padding: '48px 80px 40px',
			background: colors.bg,
			borderTop: `14px solid ${colors.accent}`,
			fontFamily: 'Serif',
			color: colors.ink,
			textAlign: 'center',
		},
		[
			h('div', { display: 'flex', alignItems: 'center', gap: 18 }, [
				h('img', {}, undefined, { src: markSvg, width: 72, height: 72 }),
				h('div', { fontSize: 34 }, site.name),
			]),
			h('div', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: 24 }, [
				h('div', { fontFamily: 'Mono', fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: colors.accent }, eyebrow),
				h('div', { fontSize: titleSize, lineHeight: 1.1, maxWidth: 960 }, title),
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
					fontSize: 21,
					letterSpacing: 1,
					color: colors.muted,
				},
				cities.join(' · '),
			),
		],
	);

	const svg = await satori(tree as Parameters<typeof satori>[0], { ...shareImageSize, fonts: await loadFonts() });
	return new Resvg(svg).render().asPng();
}
