---
name: prometheus
description: >-
  Durable cross-session epistemic memory and gotchas store. ALWAYS call memory_recall
  at task kickoff to retrieve prior architectural decisions, and memory_store at task completion.
---

# Prometheus Memory Skill

Prometheus stores durable decisions, tricky bugs, and non-obvious gotchas across agent sessions.
Using Prometheus eliminates redundant exploration and prevents repeating known failures, saving thousands of prompt tokens.

## Mandatory Workflow

### 1. Task Kickoff (Recall)
Before exploring code or modifying features, run:
call_mcp_tool(ServerName="prometheus", ToolName="memory_recall", Arguments={"query": "<topic or feature keywords>"})

Always check for stored rules (e.g. farfromhome-core-constraints, farfromhome-pedagogical-loop).

### 2. Post-Implementation (Store)
Whenever an architectural decision is locked, an edge-case bug is solved, or a performance/bundle gotcha is uncovered:
call_mcp_tool(ServerName="prometheus", ToolName="memory_store", Arguments={
  "project": "FarFromHome",
  "key": "descriptive-slug",
  "tags": ["area", "system"],
  "content": "Self-contained explanation of the decision or bug fix."
})
