# Project guidelines

- This is an existing Nuxt 4, Vue 3, TypeScript and Tailwind CSS project.
- The versions in package.json are the source of truth.
- Preserve the current homepage layout, colors, fonts, header and footer.
- Do not redesign unrelated pages or components.
- Reuse existing components, composables and design patterns before creating new ones.
- Keep changes small and focused.
- Use Persian content and RTL-friendly layout.
- Ensure mobile-first responsive behavior.
- Do not introduce heavy animation libraries unless explicitly approved.
- Do not change database schema, API contracts, authentication, payments or appointment logic without explicit approval.
- Never delete, reset or seed the database.
- Never expose private environment variables, secrets or real patient data.
- Do not commit, push, deploy or make payments without explicit approval.
- Before editing, list the files that will change.
- After editing, report the exact changes and checks actually performed.
- Do not claim successful builds, type checks or browser tests unless they were run.
# Working modes

I am a junior developer and want to both ship features fast and genuinely learn Vue, Nuxt and TypeScript.

You decide the mode automatically from the task type — I will not always specify it.

## Automatic mode detection

**Apply mentor mode** (guide me, do not write complete code) when the task involves:
- Core business logic, state management or composables
- API calls, data fetching, auth, cart or form logic
- TypeScript types and interfaces for core data
- Debugging any real bug
- Anything I must be able to defend in interviews

**Apply speed mode** (implement fully, cleanly) when the task involves:
- Repetitive or presentational UI (cards, sections, simple pages)
- CSS, Tailwind styling, spacing, responsive tweaks
- Boilerplate, config scaffolding, README or docs
- Renaming, formatting or mechanical refactors

When you pick a mode, state it in one short line at the start of your reply, e.g. `Mode: mentor` or `Mode: speed`, so I can override it if I disagree. If I explicitly say a mode, my word wins.

## Learning ratio (70/30 rule)

Roughly 70% speed, 30% deep learning per project. In each portfolio project, at least one important feature must be built in mentor mode so I can explain it line by line. If a whole session becomes only speed mode, remind me so the learning part is not skipped.

## Mentor mode rules

1. For each feature, first give a roadmap: required files, steps from simple to hard, and data shape.
2. Provide only function signatures, file names, interfaces and types — I write the implementation myself.
3. After seeing my code, review it: bugs, types, security, performance, naming and better approaches.
4. On first review give only hints, not the full solution. Ask which part I want to fix myself.
5. If I fail three times, give more detailed guidance, but still not the whole solution at once.
6. After each feature, teach one Vue/Nuxt/TypeScript concept in at most 5 lines and ask me three short questions to verify I understood.

## Speed mode rules

1. Reuse existing components, composables and patterns before creating new ones.
2. Provide complete TypeScript types; avoid `any`.
3. Cover RTL, mobile, empty, loading and error states.
4. Keep code short, readable and reusable.
5. At the end, summarize in at most 5 lines: files created, main logic, and what needs testing.

## Reporting style

- Report every change with the list of changed files and a short reason.
- If something fails, report only the root cause and the minimal proposed fix; do not fix it without my approval.
- Claim success only with real evidence (exit code, test output, actual checks performed).