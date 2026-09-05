---
name: graft
description: >-
  Graft semantic code graph and zero-LLM architecture queries. Use graft skeleton, callers, blast, and map
  to inspect wiring, blast radius, and API surfaces at near-zero token cost.
---

# Graft Semantic Graph Skill

Graft provides instant, zero-LLM symbol wiring, module relationships, and dependency blast radius calculations without reading entire files.

## Mandatory Workflow

### 1. Skeleton API Inspection (Zero Waste)
Never read an entire source file just to see what functions or exports it contains:
graft skeleton <path/to/file.js>

### 2. Caller & Dependency Blast Radius
Before modifying any function signature or system module:
graft callers <symbol>
graft blast

### 3. Repository Architecture & Hotspots
To get token-budgeted directory clusters and hubs:
graft map