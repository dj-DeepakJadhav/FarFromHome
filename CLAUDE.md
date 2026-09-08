# Claude Code Configuration. Meta Horizon Creator Competition (MHCP)

See **`AGENTS.md`**, **`README_HACKATHON.md`**, and **`Docs/submission/`** for full master authority.

## Strict Rules
1. **Packaging**: Single `index.html` at root, unminified, 100% offline, ≤ 35MB.
2. **Core Loop**: Simulation & Management (Invest to Harvest to Upgrade to Observe Growth).
3. **No Sprawl**: Prioritize depth over sprawling unfinished systems.
4. **Pacing**: Slow-burn narrative sim. The Shift 3 "Aha!" lands around 167s and that is **deliberate**, do not compress Act One or retune durations to chase a 90-second stopwatch. The metric that matters is time to *first action* (10s). Reasoning: `Docs/THE_MAKING_OF.md` §10.
5. **Submission Deliverables (`Docs/submission/`)**: Keep `DESIGN_INTENT_DOC.md` ≤ 500 words and `DEVPOST_SUBMISSION_FORM.md` current with code changes.
6. **Special Awards Focus**:
   -*Most Innovative*: German gender 3-tier spatial shelf search filter.
   -*Most Satisfying Progression*: €20 to €250 tuition goal with 5 tangible shop upgrades.

## Code Discovery Protocol (STRICT, applies to every agent)

**Project name for all MCP calls:** the graph keys projects by absolute path, so
derive it from *your* checkout rather than copying a literal, take the repo's
absolute path, drop the leading `/`, and replace every `/` with `-`. Confirm with
`list_projects` before relying on it.

1. **Use `codebase-memory-mcp` FIRST for any code exploration.** Not grep, not find.
   - `search_graph(query=..)` to locate functions, classes, routes
   - `trace_path(function_name, mode=calls|data_flow)` for call chains
   - `get_code_snippet(qualified_name)` for exact source
   - `query_graph(cypher)` for structural questions
   - `get_architecture(aspects)` for project shape
   - `search_code(pattern)` for graph-augmented text search
2. **Grep/Glob/Read are for what the graph does not model:** Markdown, JSON
   (`story.json`), build scripts, configs. And always `Read` a file before editing it.
3. **Re-index after every commit.** `index_repository(repo_path=".")`. The graph
   pins to a commit SHA, so it goes stale the moment work lands. A stale graph is
   worse than no graph: it answers confidently about code that has changed.
4. **`detect_changes` before trusting the graph** if you are unsure how old it is.

### Why this is strict here
This codebase has repeatedly hidden bugs that text search reports as fine:
`hideDialogueBox` was *called* in two places and *defined* in none; `playSfx('wrong')`
had six call sites and no implementation; `grammarEngine.js` had zero callers and
still shipped. Grep finds strings. The graph finds the missing edge.
