# Course companion

A remote MCP server that students connect to Claude or ChatGPT to follow their course. It tells them what to
practise this week, explains concepts the way the course does, gives their assistant the rubric to review their
work, and records which exercises they finished. It never stores what students write.

Design: [Course companion MCP: design](https://claude.ai/artifact/FH2XFNp8gvmyeR9jsgRSKH).

## Where things live

| What | Where |
| --- | --- |
| Courses (weeks, goals, outcomes, and optional `rule`, `exercises`, `rubric` per week) | `apps/people/src/content/professions/*.yaml` |
| Glossary for `explicar` | `apps/people/src/content/companion/glosario.yaml` |
| Usage rules | `apps/people/src/content/companion/reglas.yaml` |
| Schema for the fields above | `src/schema.ts` |
| MCP tools, resources and prompts | `src/server.ts` |
| Database tables | `migrations/` |

`bun run build` validates the content and bundles it into `src/generated/content.json`. Invalid content fails the
build. Exercise ids are where progress is stored, so never rename one that students have used.

## Links

- `/mcp` serves public content; the assistant asks which course the student follows.
- `/mcp/g-…` is a group's shared link: it knows the course and, if the group has a start date, the week.
- `/mcp/a-…` is a student's personal link: the same, plus progress.
- `/equipo/e-…` is the team lead's progress page for a group.

## Setup

```sh
bunx wrangler d1 create ai-training-companion   # put the id in wrangler.jsonc
bunx wrangler d1 migrations apply ai-training-companion --remote
bunx wrangler secret put ADMIN_TOKEN
```

Local development: `echo 'ADMIN_TOKEN=dev' > .dev.vars`, `bunx wrangler d1 migrations apply ai-training-companion --local`,
then `bun run dev` from this folder. `bun run test` runs the tests.

## Creating groups and links

Links are shown once, in the reply; the database keeps only their hashes.

```sh
curl -X POST "$ORIGIN/admin/cohorts" -H "authorization: Bearer $ADMIN_TOKEN" -d '{
  "course": "freelancers",
  "label": "Freelancers, noviembre 2026",
  "startsOn": "2026-11-02",
  "leadPage": true,
  "students": ["Ana", "Luis"]
}'

# More personal links for an existing group: a list of labels, or a number for unlabelled ones.
curl -X POST "$ORIGIN/admin/cohorts/g-xxxxxxxx/students" -H "authorization: Bearer $ADMIN_TOKEN" -d '{"students": 3}'
```

Leave out `startsOn` for a self-paced group: each student then moves on when they finish a week's exercises.
