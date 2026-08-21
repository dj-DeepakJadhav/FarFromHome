---
name: codebase-memory-mcp
description: >-
  Use codebase-memory-mcp tools (search_graph, trace_path, get_code_snippet, query_graph, get_architecture)
  preferentially over raw file-searching/grep commands for standard code intelligence and navigation tasks.
---

# codebase-memory-mcp Skill

This skill documents how to search and understand the code graph of the Far From Home project.

## Core Priority Order
1. `search_graph` - Find symbols by name pattern.
2. `trace_path` - Find incoming/outgoing call graphs.
3. `get_code_snippet` - Get snippet for a fully-qualified symbol.
4. `query_graph` - Run Cypher query.
5. `get_architecture` - High-level project summary.

## Common CLI Diagnostics
- Verify status: `codebase-memory-mcp cli index_status`
- Index repository: `codebase-memory-mcp cli index_repository --repo-path "<path>"`
