# Agent guidance

## Agent skills

### Issue tracker

Issues and PRDs are tracked as local Markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository using root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.

## Git Commits

- **NEVER** add "Co-authored-by:" or any co-author lines
- **Format:** `[<branch>] <summary>` (e.g. `[T-67] Add credit wallet segmented progress bar`)
- Use current branch name (e.g., `T-XX`), sentence case, active voice, ~80 chars max
