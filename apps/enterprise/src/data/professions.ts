import { getCollection, type CollectionEntry } from 'astro:content';

export type Profession = CollectionEntry<'professions'>;

/** Every profession page, in the order shown on the home page and in the footer. */
export async function getProfessions(): Promise<Profession[]> {
	return (await getCollection('professions')).sort((a, b) => a.data.order - b.data.order);
}

/** Short label shown above a profession page's title, e.g. "IA aplicada · Contabilidad". */
export function professionLabel(profession: Profession) {
	return `IA aplicada · ${profession.data.name}`;
}
