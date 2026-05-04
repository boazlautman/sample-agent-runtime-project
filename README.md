# Sample Agent Runtime Project

This project is intentionally built for AgentGuard discovery testing.

It includes:
- Safe read-only support agent.
- Risky refund/payment agent.
- RAG research route.
- MCP server with read and write tools.
- Diverse API routes that exercise agent, RAG, admin, and MCP patterns.

Run locally:

```bash
npm install
npm run check
npm run dev
```

MCP server:

```bash
npm run mcp
```

Expected AgentGuard scan behavior:
- Agents should be discovered from executable runtime files in `src/agents/`.
- MCP tools should be discovered from `src/mcp/customer-support-mcp.ts`.
- Read-only tools should be lower risk than payment/write/admin tools.
