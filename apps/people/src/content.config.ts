import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const legal = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/legal' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		/** Short label used in the footer. */
		label: z.string(),
		/** Footer order. */
		order: z.number(),
		updated: z.coerce.date(),
		/** Shows the owner's identification details before the text. */
		showOwner: z.boolean().default(false),
	}),
});

export const collections = { legal };
