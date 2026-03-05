## Summary
- [ ] Concisely describe the change and why it is needed.

## Atomic Commit Checklist
- [ ] This PR is composed of atomic commits (one concern per commit).
- [ ] Commit messages follow Conventional Commits (`type(scope): summary`).
- [ ] No generated artifacts are included (`.next*`, `coverage/`, `dist/`).
- [ ] File-size guardrails are respected (no tracked files over 1 MB).
- [ ] I ran required local checks (`pnpm run check:types`, `pnpm test`).
- [ ] CI status checks are green (`guard-files`, `typecheck`, `test`, `build`, `commitlint`).

## Validation
- [ ] Add notes/screenshots/test output relevant to this change.
