# Conduit

**An agentic coding assistant for your terminal that edits code, fixes build/test
failures, scaffolds projects, and learns your codebase — driven through a free web
AI (Google Gemini, Claude, Grok, or ChatGPT) in your own browser. No API key.**

> [!NOTE]
> This project is currently in **beta and early release**. Selectors and agentic loops are actively being improved.

Conduit keeps one AI conversation, sends it just the relevant code, applies fixes
as anchored diffs (never full-file rewrites), reruns your command to prove it's
fixed, and gets smarter about your repo the more you use it. Code edits apply
automatically (with backups); terminal commands always ask first.

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

## What's new in v1.0.1

- **Two more sites, driven end-to-end**: Grok (grok.com) and DeepSeek
  (chat.deepseek.com) join Gemini, Claude, and ChatGPT. Gemini, Claude, Grok,
  and ChatGPT are fully tested; DeepSeek's selectors are best-effort — verify
  with `conduit doctor --browser --chat-site deepseek` before relying on it.
- **More reliable replies**: fixed a bug where Grok's reply could come back
  empty (a trailing suggestion chip was confusing the extractor), and a bug
  where Claude could appear to hang with no response. Reply-completion
  detection no longer depends on a single flickering "Stop" indicator.
- **Rate-limit friendly**: Conduit now paces its own messages so it can't fire
  requests back-to-back, and detects when a site's usage limit is hit — it
  stops and tells you, instead of quietly resending and burning more of an
  already-exhausted quota.
- **Sign-in is now required and verified** during setup, for every site — no
  more silently failing later because the browser profile was never actually
  logged in.
- **Smarter repair loop**: when an applied fix leaves the exact same error
  standing, Conduit now escalates (whole files → last-committed reference)
  instead of retrying with the same narrow context; long error output keeps
  both the head and the tail, so the actual failing-test summary survives
  instead of getting cut off.
- **Fixed a packaged-binary crash**: `conduit --help` (and other output using
  arrows/checkmarks) could crash on some Windows setups due to a console
  encoding issue — fixed.

---

## Scope — what Conduit is (and isn't)

**Conduit is** a middleman between your codebase and a web AI. It runs on your
machine, reads your repo, drives the AI website you're already signed into, and
turns its replies into safe, reviewable actions: anchored file edits, gated shell
commands, and per-repo knowledge it accumulates over time.

| It does | It deliberately does **not** |
|---|---|
| Drive a free web AI through your browser (no API key) | Use an API key / paid endpoint |
| Fix build & test failures agentically (capture → fix → verify → repeat) | Replace your IDE or run autonomously without approval gates |
| Edit code as **anchored diffs** so unrelated lines can't vanish | Rewrite whole files as its default write path |
| Scaffold & set up projects by driving CLI tools step by step | Type into interactive prompts a command opens (use `--no-interaction` flags) |
| Build a persistent, hash-verified **brain** of your repo | Train the AI model's weights, or use embeddings / a vector DB |
| Keep you in control — dangerous commands always confirm | Run destructive commands silently, ever |

The guiding principle is **fidelity over fabrication**: Conduit never silently
drops or invents code, and every piece of learned knowledge is verified against the
real files. See [SECURITY.md](SECURITY.md) for the threat model.

---

## What it can do

**Agentic coding**
- **Fix build/test errors** — one-shot (`conduit fix -- <cmd>`) or in chat. It
  captures the failure, sends the referenced files, applies a fix, reruns to
  verify, and escalates if a fix doesn't land (whole files → last-committed git
  version → reconstruction).
- **Edit on request** — "add a loading spinner to Header.tsx", "rename this
  function everywhere". Edits are anchored find-and-replace, shown as a diff.
- **Anchor pre-flight** — before writing, it dry-runs every edit; if an anchor no
  longer matches (the file drifted), it re-reads the current text and corrects
  itself instead of applying a broken change.
- **Explore locally & instantly** — the AI can request file outlines, windows,
  grep, glob, symbol lookup, dependency graphs, and concept search, all answered
  from a local index with no browser round-trip.

**Project setup & scaffolding**
- Ask "set up a Laravel project" (or Next.js, a migration, an install) and Conduit
  drives the CLI **step by step** — running one command, reading its output, then
  deciding the next — using non-interactive flags. It's **OS-aware** (Windows
  `cmd.exe` vs POSIX), and if a command fails it **feeds the error back and
  self-corrects** (e.g. a wrong-platform command).

**The brain — it learns your codebase**
- `/study` distills files into knowledge **cards** (what each file is *for*, its
  key symbols, gotchas), each **hash-verified** against the real file so stale
  knowledge is quarantined, never trusted.
- A **co-change graph** (seeded from `git log`) knows which files change together.
- That knowledge is injected — budget-capped and clearly labelled — so Conduit
  gives better first answers and needs fewer exploration rounds over time.
  `/brain` shows what it knows and whether it's paying off.

**Terminal UI (when run interactively)**
- A multi-line, auto-wrapping **chat box**; `@file` autocomplete; a browsable
  `/help` panel; a **live Terminal tab** streaming the running command's output;
  and a session sidebar (status, files changed, backups).

**Safe by design**
- Anchored edits + backups + git-restore. Dangerous commands always confirm.
- Command classifier blocks exfiltration (reading files outside the repo),
  `.git/` hook writes, interpreter one-liners, and command chaining from auto-run.

---

## Requirements

- **Google Chrome**
- An account on the AI site you want to drive (Gemini, Claude, Grok, ChatGPT,
  or DeepSeek — see [What's new](#whats-new-in-v101) for which are fully tested)
- *Note: Python is not required to be installed by the user; the npm package runs a pre-compiled standalone binary.*

Playwright + a Chromium build are configured automatically the first time you run.

---

## Install

No Python or virtual environment setup is required. Simply run via `npx` or install globally:

```bash
# Run instantly without a global installation:
npx conduit-agent-cli

# Or install globally:
npm install -g conduit-agent-cli
```

Once installed globally, you can run the `conduit` command directly from any project directory.

---

## Setup & first run

Just run it in your project:

```bash
conduit
```

On the **first run**, Conduit launches a short **setup wizard**:

```
Which AI website should Conduit drive?
  gemini    Google Gemini — free · tested
  claude    Claude.ai · tested
  grok      Grok (grok.com) · tested
  chatgpt   ChatGPT · tested
  deepseek  DeepSeek (chat.deepseek.com) · best-effort
```

It writes `conduit.json`, then opens a **normal Chrome** for you to **sign in
once** — sign in, close that window, press Enter. (A normal window is used because
Google blocks sign-in inside automated browsers; the session is then reused for
every future run.)

Then you're in the chat, cursor ready in the box:

```
❯ fix my build
❯ why did that fail?
❯ add a loading spinner to Header.tsx
❯ set up a Vite + React app in this folder
```

- `/help` opens a browsable command panel · `/exit` quits.
- Re-run the wizard anytime with `conduit setup` (switching sites clears a stale
  conversation URL automatically).
- **Watch it work:** add `--show-browser` to see the Chrome window drive the AI.

---

## Using it day to day

### The chat REPL — `conduit` or `conduit chat`
A continuous session: one browser, one AI thread. Type natural-language requests;
slash commands are handled locally and never sent to the AI.

- **Enter** sends · **Ctrl+J** inserts a newline · **@path** attaches a file
  (with autocomplete) · a running turn locks the input so you can't stack requests.

### One-shot — `conduit fix`
```bash
conduit fix -- <your build or test command>     # e.g. -- npm run build
conduit fix --error-file error.txt              # repair from a saved error log
conduit fix --paste                             # paste an error on stdin
```

### Teach it your repo — `/study` and `/brain`
```
/study conduit/engine        # study a folder
/study the login module      # …or just describe it — Conduit finds the files
/brain                       # what it knows: cards, co-change pairs, stats
```
`/study` costs AI round-trips (it reads and summarizes), so it asks before running
and is the only feature that does. Everything else the brain does is free.

---

## Slash commands

All slash commands are local (never sent to the AI). In the TUI, `/help` opens an
interactive panel with a usage example for each; press **Enter** on a command to
drop it into your input box.

**Coding**

| Command | Does |
|---|---|
| `/fix [cmd]` | Run a command, capture the failure, start the repair loop |
| `/run <cmd>` | Run a shell command (danger-screened); its output joins the context |
| `/verify [cmd]` | Show or set the command re-run after each fix |
| `/index` | Rebuild the repo index from scratch |
| `/diff` | Show everything changed this session |
| `/undo [turn]` | Restore the last backup set; `/undo turn` reverts the whole last turn |

**Brain (persistent codebase knowledge)**

| Command | Does |
|---|---|
| `/study [path \| folder \| words]` | Learn files into the brain — a path, a folder, or a plain-words description |
| `/brain [forget <path\|all>]` | Show what the brain knows (cards, co-change pairs, stats), or prune it |

**Session**

| Command | Does |
|---|---|
| `/review on\|off` | Approve each file edit before it's written |
| `/selfreview on\|off` | Pre-apply self-check on big multi-file edits |
| `/prefetch on\|off` | Auto-outline files you name in a message |
| `/yes on\|off` | Auto-run safe commands (dangerous ones still ask) |
| `/verbose on\|off` | Toggle full pipeline narration |
| `/trace on\|off` | Write a full debug transcript to `.conduit/trace.log` |
| `/status` | Session summary: files, commands, turns, elapsed |

**Conversation**

| Command | Does |
|---|---|
| `/new` | Start a brand-new chat (and forget the saved URL) |
| `/chat [url\|save]` | Show, resume, or save the conversation URL |
| `/clear` | New thread this session (keeps the saved URL) |

**Setup & diagnostics**

| Command | Does |
|---|---|
| `/setup` | Re-run the first-run setup wizard |
| `/login` | Sign into Conduit's browser profile |
| `/chrome [opts]` | Launch Chrome with a debug port for attach mode |
| `/doctor` | Check the configured AI site is reachable and set up |
| `/config` | Show effective configuration and where each value came from |
| `/backups` | List saved backup sets |
| `/mirror` | Start the local chat-style mirror display |

**Help & exit**

| Command | Does |
|---|---|
| `/help` | Show help (an interactive panel in the TUI) |
| `/exit` | End the session |

---

## CLI command reference

| Command | Purpose |
|---|---|
| `conduit` / `conduit chat` | Open the agentic chat REPL (runs the setup wizard on first use) |
| `conduit setup` | Re-run the first-run wizard (pick the AI site, sign in) |
| `conduit fix -- <cmd>` | One-shot: run, diagnose, fix, verify |
| `conduit login` | Sign in once to Conduit's browser profile |
| `conduit doctor --browser` | Smoke-test the browser session (open a thread, ping, extract) |
| `conduit doctor --probe-limits` | Measure your account's real composer input limit |
| `conduit config` | Show the effective configuration and where each value came from |
| `conduit index` | Build the repo index used for context matching |
| `conduit undo` / `conduit backups` / `conduit diff` | Revert / list / view changes |
| `conduit chrome` | Launch Chrome with a debug port for attach mode |

Run `conduit <command> --help` for all flags. Useful ones: `--show-browser`
(visible window), `--verbose` (full narration), `--trace` (debug transcript),
`--yes` (auto-run safe commands), `--review` (approve each edit).

---

## Configuration (`conduit.json`)

Every key is optional; copy `conduit.json.example` from the repository for the
full annotated list. The most useful:

```json
{
  "max_attempts": 3,              // repair rounds before giving up
  "run_commands": true,           // let the AI propose commands (always gated)
  "review_edits": false,          // true = approve every file edit first
  "verbose": false,               // true = full pipeline narration
  "trace": false,                 // true = write .conduit/trace.log

  // which AI website to drive:
  "chat_site": null,              // "gemini" (default) | "claude" | "chatgpt" | "grok" | "deepseek"
  "chat_url": null,               // resume a specific conversation by URL
  "browser_headless": true,       // false = show the browser window

  // brain / study:
  "anchor_bounce": true,          // dry-run edits and re-anchor before applying
  "study_batch_files": 5          // files per /study round-trip
}
```

Precedence: built-in defaults → `conduit.json` → `CONDUIT_*` env vars → CLI flags.

---

## Safety model

| Action | Behavior |
|---|---|
| **Code edits** | Apply automatically — the diff is shown, and backups / git make them reversible. Use `--review` to approve each file. |
| **Terminal commands** | **Always ask.** `--yes` auto-runs only *safe* ones. |
| **Dangerous commands** (delete, push, deploy, `sudo`, pipe-to-shell, interpreter one-liners, chaining, anything reaching outside the repo) | **Always ask, no exceptions** — even under `--yes`; refused entirely with no interactive input. |
| **File paths** | Sandboxed to the project — never absolute, `..`, `.conduit/`, or `.git/`. |
| **Reading files** | Auto-run inspect commands (`cat`, `grep`, …) are jailed to the repo, so a command can't read your `~/.ssh` keys and send them to the AI. |

Reverting: inside a git repo, use `git restore`; otherwise `conduit undo` restores
the last backup set, or `/undo turn` reverts a whole turn. Full threat model and
residual risks in `SECURITY.md`.

---

## Browser mode: how it works & good to know

Conduit drives a **dedicated, persistent Chrome profile** at
`~/.conduit/browser_profile` — sign in once (`conduit login`) and it's remembered.

- **It's a separate browser from your everyday Chrome, on purpose.** To also see
  Conduit's chats in your normal browser, sign **both** into the **same account**
  (conversations are stored per-account, server-side).
- **You can't attach to your normal open Chrome.** Since Chrome 136, Chrome
  disables remote debugging on your real profile for security — Conduit's own
  profile is the supported path.
- **Gemini is the proven site.** Claude and ChatGPT route and log in correctly, but
  their page selectors are best-effort. Run
  `conduit doctor --browser --chat-site <site>` to check.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Google: *"This browser or app may not be secure"* | Don't let automation log in — run `conduit login` (a plain Chrome), sign in, close it, press Enter. |
| It keeps replying with the **same** message to new questions | The composer wedged — run `/new` to start a fresh thread. |
| A proposed command used the **wrong shell** (`rm` on Windows) | It self-corrects now, but `/new` + retry also resets it. |
| Chat opens but nothing happens on a non-Gemini site | Selectors for Claude/ChatGPT need tuning; run `conduit doctor --browser --chat-site <site>`. |
| `conduit` not found | Try running via `npx conduit-agent-cli` or ensure global npm bin directory is in your PATH. |
| Want to see what it's doing | `--verbose` (narration), `--show-browser` (window), or `/trace on` (full transcript to `.conduit/trace.log`). |

---

## License

MIT
