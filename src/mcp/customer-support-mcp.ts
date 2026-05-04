#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { createRefund, lookupCustomer, searchKnowledgeBase, sendSlackAlert } from '../tools/customer-tools.js';

const server = new McpServer({
  name: 'sample-customer-support-mcp',
  version: '1.0.0',
});

server.tool(
  'lookup_customer',
  'Read-only CRM lookup. Safe for support agents.',
  {
    customerId: z.string(),
  },
  async ({ customerId }) => {
    const result = await lookupCustomer(customerId);
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  },
);

server.tool(
  'search_knowledge_base',
  'Read-only RAG source search across approved support docs.',
  {
    query: z.string(),
  },
  async ({ query }) => {
    const result = await searchKnowledgeBase(query);
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  },
);

server.tool(
  'send_slack_alert',
  'Write-capable external messaging tool. Should be guarded by policy.',
  {
    channel: z.string(),
    text: z.string(),
  },
  async ({ channel, text }) => {
    const result = await sendSlackAlert(channel, text);
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  },
);

server.tool(
  'create_refund',
  'Payment write tool. Requires approval before execution.',
  {
    customerId: z.string(),
    amountCents: z.number(),
  },
  async ({ customerId, amountCents }) => {
    const result = await createRefund(customerId, amountCents);
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
