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

## Local Guardrails

Local hooks run automatically:

- `pre-commit`: staged-file guard + TypeScript check
- `commit-msg`: commitlint Conventional Commit validation
- `pre-push`: test suite

Manual commands:

```bash
pnpm run guard:staged
pnpm run guard:tracked
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
- `typecheck`
- `test`
- `build`
- `commitlint`

PRs to `main` must pass all required checks.

## Repository Settings (Manual)

Configure these in GitHub settings:

1. Set default branch to `main`.
2. Protect `main`:
   - Require pull request before merge.
   - Require all status checks listed above.
   - Disable direct pushes to `main`.
