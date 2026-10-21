// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
// Canonical URLs, Open Graph URLs and the sitemap all use the production domain, also on preview builds,
// so search engines index one copy. A SITE_URL build variable overrides it.
export default defineConfig({
	site: process.env.SITE_URL || 'https://ai-enterprise.ankornova.com',
	// Inline all CSS: the first paint waits on no stylesheet, and a page cached by lib/pageCache
	// never points at a stylesheet that a later deploy removed.
	build: { inlineStylesheets: 'always' },
	integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
});
