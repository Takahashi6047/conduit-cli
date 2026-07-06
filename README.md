# Conduit

**An agentic coding assistant for your terminal — it edits code, fixes build/test
failures, scaffolds projects, and learns your codebase, driven through a free web
AI (Google Gemini, Claude, or ChatGPT) in your own browser. No API key.**

```bash
npx conduit-cli
```

That's it — no Python, no virtualenv, no PATH setup. Conduit downloads a single
prebuilt binary for your platform and runs.

```
❯ fix my build
  ▶ running npm run build …                       ✗ exit 1
      src/pages/Inquiry.tsx(52,5): error TS1005: ',' expected.
  ◆ diagnosis (HIGH): handleSubmit is truncated mid-statement.
  ⏺ edit src/pages/Inquiry.tsx                     +14 -1
  ⟳ verifying — re-running npm run build …         ✓ passes
  ✓ Fixed in 1 attempt
```

---

## Install

```bash
# run instantly, no install:
npx conduit-cli

# or install globally:
npm install -g conduit-cli
conduit
```

**Requirements:** Node.js 16+, Google Chrome, and an account on the AI site you
want to drive (Gemini, Claude, or ChatGPT). That's all — the AI is free and runs
in your own browser, signed into your own account.

---

## What it does

- **Fixes build & test failures** — captures the error, sends the AI just the
  relevant files, applies an anchored diff, reruns to verify, and escalates if a
  fix doesn't land. One-shot (`conduit fix -- npm run build`) or in chat.
- **Edits on request** — "add a loading spinner to Header.tsx", "rename this
  everywhere" — as reviewable diffs, never silent full-file rewrites.
- **Sets up & scaffolds projects** — "set up a Laravel project", "scaffold a Vite
  app" — it drives the CLI step by step, reads each result, and self-corrects
  (it's OS-aware: Windows `cmd` vs POSIX).
- **Learns your codebase** — `/study` distills files into hash-verified knowledge
  it reuses for better answers over time; `/brain` shows what it knows.
- **Keeps you in control** — code edits apply automatically (with backups & git
  restore); terminal commands always ask, and dangerous ones always confirm.

---

## Quick start

Run `conduit` in your project. On first use, a short wizard picks your AI site and
opens a normal Chrome so you **sign in once** (reused forever after). Then type
naturally:

```
❯ fix my build
❯ why did that fail?
❯ add a loading spinner to Header.tsx
❯ set up a Vite + React app in this folder
```

`/help` opens a browsable command panel · `/exit` quits · `@path` attaches a file
· **Enter** sends, **Ctrl+J** for a newline.

---

## Handy commands

| | |
|---|---|
| `/fix [cmd]` | run a command, capture the failure, start the repair loop |
| `/study <path\|words>` | teach Conduit part of your codebase |
| `/brain` | show what it has learned |
| `/undo [turn]` | revert the last backup set, or a whole turn |
| `/diff` · `/status` · `/help` | changes this session · summary · full command list |

Run `conduit --help` for CLI flags (`--show-browser`, `--yes`, `--verbose`, …).

---

## Safe by design

- **Anchored edits** — the AI must quote the exact text it changes, so it can't
  silently drop unrelated code. Every change is backed up and git-restorable.
- **Command gating** — dangerous commands (delete, push, `sudo`, reading files
  outside your project, …) **always** ask first, even with `--yes`.
- **Sandboxed writes** — file paths are jailed to your project; it never touches
  `.git/`, `.conduit/`, or anything outside the repo.

---

## How it works

Conduit drives a **dedicated Chrome profile** signed into your AI account — it
types your context into one conversation thread and reads the reply back, exactly
as you would by hand. No API key, no data sent to any server but the AI site you
chose. Gemini is the most-tested; Claude and ChatGPT are supported.

---

## License

MIT
