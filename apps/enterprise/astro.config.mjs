// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
// SITE_URL is set as a build variable in Cloudflare; it enables canonical URLs, Open Graph URLs and the sitemap.
export default defineConfig({
	site: process.env.SITE_URL,
	// Inline all CSS: the first paint waits on no stylesheet, and a page cached by lib/pageCache
	// never points at a stylesheet that a later deploy removed.
	build: { inlineStylesheets: 'always' },
	integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
});
