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

const titledItem = z.object({ title: z.string(), body: z.string() });

/** "IA aplicada" programme for one profession, from zero. Each file is one page under routes.profession. */
const professions = defineCollection({
	loader: glob({ pattern: '*.yaml', base: './src/content/professions' }),
	schema: z.object({
		/** Name of the profession, used in links and labels, e.g. "Desarrolladores". */
		name: z.string(),
		/** Order on the home page and in the footer. */
		order: z.number(),
		title: z.string(),
		/** Meta description. */
		description: z.string(),
		/** One line for the profession's card on the home page. */
		summary: z.string(),
		lead: z.string(),
		/** Who the programme is for, in one line, for structured data. */
		audience: z.string(),
		/** Practitioner who reviews the content, described by role only until they agree to be named. */
		reviewer: z.string(),
		/** Whether the enterprise site publishes the same profession for teams. */
		teamEdition: z.boolean().default(true),
		/** Starter pack of tools covered in the programme. */
		tools: z.array(z.string()),
		/** Everyday tasks where the programme applies AI. */
		tasks: z.array(titledItem),
		/** Programme, one entry per week, in teaching order. */
		weeks: z.array(z.object({ title: z.string(), goal: z.string(), outcome: z.string() })),
		/** The profession's main objection to using AI, and the answer. */
		objection: z.object({ question: z.string(), answer: z.string() }),
		forWho: z.array(z.string()),
		notForWho: z.array(z.string()),
		faq: z.array(z.object({ question: z.string(), answer: z.string() })),
	}),
});

export const collections = { legal, professions };
