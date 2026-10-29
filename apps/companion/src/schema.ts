import { z } from 'zod';

/**
 * Course content as the companion reads it. The profession YAMLs are owned by the people site
 * (apps/people/src/content.config.ts); this schema only adds the optional fields the companion uses,
 * so a course without them still works: `hoy` falls back to the week's goal and outcome, and
 * `revisar_entrega` to a rubric built from the outcome and the usage rules.
 */
export const exerciseSchema = z.object({
	/** Unique within the course; progress is stored against it, so never rename a published id. */
	id: z.string().regex(/^[a-z0-9-]+$/),
	title: z.string(),
	minutes: z.number().int().positive(),
	steps: z.array(z.string()).min(1),
	/** A prompt the student can adapt, written for their own material. */
	examplePrompt: z.string().optional(),
	/** What a good result looks like, so the assistant can say when the student is done. */
	goodLooksLike: z.array(z.string()).default([]),
});

export const weekSchema = z.object({
	title: z.string(),
	goal: z.string(),
	outcome: z.string(),
	/** The usage rule the student must keep in mind this week, e.g. what never to paste. */
	rule: z.string().optional(),
	exercises: z.array(exerciseSchema).default([]),
	/** Checklist for the week's outcome. */
	rubric: z.array(z.string()).default([]),
});

export const courseSchema = z.object({
	name: z.string(),
	order: z.number(),
	title: z.string(),
	summary: z.string(),
	lead: z.string(),
	teamEdition: z.boolean().default(true),
	tools: z.array(z.string()),
	weeks: z.array(weekSchema).min(1),
});

export const conceptSchema = z.object({
	id: z.string().regex(/^[a-z0-9-]+$/),
	term: z.string(),
	/** Other words students use for it; `explicar` matches on these too. */
	aliases: z.array(z.string()).default([]),
	explanation: z.string(),
	/** Where the live session covers it, e.g. "Sesión introductoria, tema 01, diapositivas 3 a 5". */
	seeAlso: z.string().optional(),
});

export const rulesSchema = z.object({
	rules: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
});

export const contentSchema = z.object({
	courses: z.record(z.string(), courseSchema),
	glossary: z.array(conceptSchema),
	rules: rulesSchema.shape.rules,
});

export type Exercise = z.infer<typeof exerciseSchema>;
export type Week = z.infer<typeof weekSchema>;
export type Course = z.infer<typeof courseSchema>;
export type Concept = z.infer<typeof conceptSchema>;
export type Content = z.infer<typeof contentSchema>;
