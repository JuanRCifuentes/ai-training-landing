// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// SITE_URL is set as a build variable in Cloudflare; it enables canonical and Open Graph URLs.
export default defineConfig({
	site: process.env.SITE_URL,
});
