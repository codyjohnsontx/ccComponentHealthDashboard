# Atomic Commit Workflow

This repository uses strict local and CI guardrails to prevent accidental "commit everything" pushes.

## Commit Rules

1. Keep each commit to one concern.
2. Use Conventional Commit messages.
3. Do not commit generated artifacts or caches.
4. Keep tracked files under 1 MB unless explicitly approved via process change.

## Commit Message Format

Use this structure:

```text
type(scope): short summary
```

Examples:

- `feat(offers): add best delivered ranking`
- `fix(setup): keep bike selection when adding preset`
- `chore(repo): ignore generated next build artifacts`

### What commitlint enforces

`commitlint.config.cjs` extends `@commitlint/config-conventional` with no rule
overrides, so a message is rejected when it:

- has no type, or a type outside `build`, `chore`, `ci`, `docs`, `feat`, `fix`,
  `perf`, `refactor`, `revert`, `style`, `test`
- writes the type in anything but lower-case, so `Fix(dashboard): ...` is rejected
- has no subject, or ends the subject with a period
- writes the subject in sentence-case, start-case, pascal-case or upper-case;
  capitalizing the first word is enough to fail, so use
  `fix(dashboard): keep the chosen bike filter`, not
  `fix(dashboard): Keep the chosen bike filter`
- has a header (the `type(scope): summary` line) longer than 100 characters
- leaves leading or trailing whitespace on the header
- wraps body lines beyond 100 characters
- wraps footer lines beyond 100 characters

Two further rules are warnings rather than errors: `body-leading-blank` and
`footer-leading-blank` report a missing blank line before the body or footer
without failing the run.

Do not silence these rules to land a message. A commitlint run that cannot
reject anything still reports success, and that green check then reads as
evidence the message was validated.

The CI job lints every commit in the pushed or proposed range, so tooling that
commits onto a branch has to produce conforming messages too. The no-mistakes
pipeline's fix-commit prefix is configured in `.no-mistakes.yaml` for that
reason: point the tool at a real type instead of relaxing a rule here.

## Local Guardrails

Local hooks run automatically:

- `pre-commit`: staged-file guard + TypeScript check
- `commit-msg`: commitlint Conventional Commit validation
- `pre-push`: test suite

Manual commands:

```bash
pnpm run guard:staged
pnpm run guard:tracked
pnpm lint
pnpm run check:types
pnpm test
pnpm build
```

## Hook Failure Playbook

### Blocked generated paths

If a hook reports blocked paths (for example `.next_stale_runtime_fix`):

1. Remove them from staging:
   `git restore --staged <path>`
2. If they should never be tracked, ensure they are in `.gitignore`.
3. If already tracked historically, untrack with:
   `git rm -r --cached <path>`

### Oversized tracked/staged files

If a file exceeds 1 MB:

1. Remove it from staging/tracking.
2. Move to an approved asset flow or external storage.
3. Split unrelated changes into separate commits.

### Commit message rejected

Rewrite the commit message to Conventional Commit format:

```bash
git commit --amend
```

## CI Enforcement

GitHub Actions required checks:

- `guard-files`
- `lint`
- `typecheck`
- `test`
- `build`
- `commitlint`
- `e2e`

PRs targeting any branch listed in `.github/workflows/ci.yml` must pass all required checks.

## Repository Settings (Manual)

Configure these in GitHub settings:

1. Set default branch to `main`.
2. Protect `main`:
   - Require pull request before merge.
   - Require all status checks listed above.
   - Disable direct pushes to `main`.
