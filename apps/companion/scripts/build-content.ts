/**
 * Bundles the course content into src/generated/content.json, which the Worker imports.
 * The profession YAMLs stay owned by the people site, so a merged content change reaches the
 * site and the companion on the same deploy. Fails the build on invalid content.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { contentSchema, conceptSchema, courseSchema, rulesSchema, type Course } from '../src/schema';

const professionsDir = join(import.meta.dir, '../../people/src/content/professions');
const companionDir = join(import.meta.dir, '../content');
const outFile = join(import.meta.dir, '../src/generated/content.json');

const readYaml = async (path: string): Promise<unknown> => Bun.YAML.parse(await readFile(path, 'utf8'));

function fail(message: string): never {
	throw new Error(`build-content: ${message}`);
}

const courses: Record<string, Course> = {};
for (const file of (await readdir(professionsDir)).filter((f) => f.endsWith('.yaml')).sort()) {
	const parsed = courseSchema.safeParse(await readYaml(join(professionsDir, file)));
	if (!parsed.success) fail(`${file}: ${parsed.error.message}`);
	const ids = parsed.data.weeks.flatMap((w) => w.exercises.map((e) => e.id));
	const duplicate = ids.find((id, i) => ids.indexOf(id) !== i);
	if (duplicate) fail(`${file}: exercise id "${duplicate}" is used twice`);
	courses[basename(file, '.yaml')] = parsed.data;
}

const glossary = conceptSchema.array().safeParse(await readYaml(join(companionDir, 'glosario.yaml')));
if (!glossary.success) fail(`glosario.yaml: ${glossary.error.message}`);
const rules = rulesSchema.safeParse(await readYaml(join(companionDir, 'reglas.yaml')));
if (!rules.success) fail(`reglas.yaml: ${rules.error.message}`);

const content = contentSchema.parse({ courses, glossary: glossary.data, rules: rules.data.rules });
await mkdir(join(outFile, '..'), { recursive: true });
await writeFile(outFile, JSON.stringify(content));
console.log(`build-content: ${Object.keys(courses).length} courses, ${glossary.data.length} concepts`);
