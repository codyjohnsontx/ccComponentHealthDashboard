# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- **There is no server-side store.** The `POST` route handlers under
  `app/api/projects/cc-component-health/` validate their payload, compute the state or
  event they would produce, echo it back with `persisted: false`, and discard it. The
  browser owns all state: `src/features/cc-component-health/context/DemoStateProvider.tsx`
  applies the same reducers and persists to `localStorage` via `saveDemoState`. This is a
  deliberate demo façade, not an unfinished feature - do not "fix" it by adding a database.
  See the Public API Surface section of `README.md`.
- Mutations under `server/mutations/` are pure reducers shared by the routes and the client
  provider. `validateBikeSetup` only validates; it is named for what it does.
- Quality gates mirror `.github/workflows/ci.yml`: `pnpm run guard:tracked`, `pnpm lint`,
  `pnpm run check:types`, `pnpm test`, `pnpm build`. E2E is `pnpm test:e2e` and is not in CI.
- `eslint.config.mjs` keeps base `no-undef`/`no-unused-vars` on for JS and swaps in
  `@typescript-eslint/no-unused-vars` for TS, because the base rules cannot read TypeScript
  type positions. Do not disable them repo-wide to silence that.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
