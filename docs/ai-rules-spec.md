# AI Rules Improvement — Spec

**Status:** Ready to implement

## Problem

The `rules/` directory contains high-quality guidance but is not wired up for automatic injection. Most files lack YAML frontmatter, so Claude never auto-activates them based on file context — they are only consulted when explicitly referenced. Two files (`architecture.md`, `docker-setup.md`) also contain sections that add noise for AI agents without adding value.

## Goals

1. Rules fire automatically when relevant (glob-based injection).
2. Rules are silent when irrelevant — no backend rules while editing frontend code and vice versa.
3. Core cross-cutting rules (`clean-code`, `domain-driven-design`) are always in scope.
4. `architecture.md` and `docker-setup.md` are trimmed of noise without losing scaffold value.
5. `AGENTS.md` remains the single agent entry point — no separate `CLAUDE.md`.
6. `rules/` remains the single source of truth for all rule content.

---

## ~~Task 1 — Add frontmatter to all rule files~~ (dropped)

Frontmatter is Claude Code-specific. Rules files must remain AI-agnostic — no YAML frontmatter in any rule file.

---

## Task 2 — Trim `architecture.md`

Remove only the **Table of Contents** section (lines 9–19). All other content — including the ASCII diagram, JSON/YAML tech stack blocks, and key decisions table — is retained. When building from scratch, an agent needs the stack versions and the rationale behind decisions.

Frontmatter to prepend (see Task 1 table above).

---

## Task 3 — Trim `docker-setup.md`

Remove speculative/future sections that describe work not yet done and should not be treated as requirements by an AI agent:

- **"Production Deployment (Future)"** section — remove entirely
- **"Monitoring (Future)"** section — remove entirely
- **"Performance Optimisation"** section — remove (implementation detail, not agent guidance)

Retain everything else including the ASCII network diagram (human readability) and the full Dockerfiles and Compose YAML (scaffold reference for building from scratch).

Frontmatter to prepend (see Task 1 table above).

### Troubleshooting gotchas → `AGENTS.md`

Extract the key failure modes from the Troubleshooting section and fold into `AGENTS.md` under the existing `## Gotchas` section. These are project-specific behaviours an agent giving instructions should know:

- Hot reload not working → `usePolling: true` in Vite config
- Port already in use → `lsof -i :<port>` to identify
- Database migrations failed → `prisma migrate reset` or `migrate resolve`
- Environment variables not loaded → containers need restart after `.env` changes
- Permission denied on node_modules → remove host `node_modules`, rebuild containers

The full troubleshooting detail remains in `docker-setup.md`; `AGENTS.md` gets the one-liner summary of each.

---

## Task 4 — Update `AGENTS.md`

- Expand the `## Gotchas` section with the Docker troubleshooting one-liners from Task 3
- Confirm `@rules/architecture.md` is referenced (it already is — no change needed)
- Remove `rules/docker-setup.md` from the `## Detailed rules` list if it was added there — it is a scaffold/reference document, not a behavioural ruleset

---

## Out of Scope

- Creating a `CLAUDE.md` — `AGENTS.md` is sufficient
- Creating `.github/copilot-instructions.md`
- Moving `rules/` to `.claude/rules/`
- Modifying rule content — the Must/Should/Could structure, code examples, and governance decisions are not changing

---

## Files Changed

| File | Change |
|---|---|
| `rules/typescript-rules.md` | Add frontmatter |
| `rules/react-rules.md` | Add frontmatter |
| `rules/nestjs.md` | Add frontmatter |
| `rules/gds-design-system.md` | Add frontmatter |
| `rules/vite.md` | Add frontmatter (project name already fixed) |
| `rules/clean-code.md` | Complete frontmatter — add `alwaysApply: true` |
| `rules/domain-driven-design.md` | Complete frontmatter — add `alwaysApply: true` |
| `rules/architecture.md` | Add frontmatter, remove Table of Contents |
| `rules/docker-setup.md` | Add frontmatter, remove Future/speculative sections |
| `AGENTS.md` | Expand Gotchas with Docker troubleshooting one-liners |
