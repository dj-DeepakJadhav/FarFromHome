---
name: headroom
description: >-
  Headroom Context Optimization Layer. Compress large tool outputs, file chunks, and search results
  using headroom_compress and retrieve via headroom_retrieve to strictly bound token consumption.
---

# Headroom Optimization Skill

Headroom minimizes context window inflation by compressing verbose inputs, logs, test runs, and file chunks into token-efficient summaries with retrieval hashes.

## Mandatory Workflow

### 1. Compressing Heavy Outputs
When receiving or generating large textual dumps (>100 lines, large JSON, or test logs):
call_mcp_tool(ServerName="headroom", ToolName="headroom_compress", Arguments={
  "content": "<large content text>"
})

### 2. Retrieving Details On-Demand
When specific sections are needed from compressed summaries:
call_mcp_tool(ServerName="headroom", ToolName="headroom_retrieve", Arguments={
  "hash": "<hash from compressed marker>"
})

### 3. Monitoring Savings
Inspect live compression savings and efficiency:
call_mcp_tool(ServerName="headroom", ToolName="headroom_stats", Arguments={})
