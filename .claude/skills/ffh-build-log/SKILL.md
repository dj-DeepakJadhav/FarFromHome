---
name: ffh-build-log
description: Automatically appends architectural changes, completed milestones, and design iterations to Docs/submission/BUILD_LOG.md.
---

# FFH Build Log Enforcement Skill

After every meaningful session or feature implementation:

## Rules:
1. Append an entry to `Docs/submission/BUILD_LOG.md` (under `## Sessions`) formatted by date (`YYYY-MM-DD`). This file is a required competition deliverable, so keep it honest: name what the AI agent did versus what was hand-tuned, and record reversals rather than quietly dropping them.
2. Clearly describe:
   - What changed
   - Why it changed
   - The verified outcome or test result.
