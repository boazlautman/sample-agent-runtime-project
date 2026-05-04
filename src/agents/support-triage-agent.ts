import OpenAI from 'openai';
import { lookupCustomer, searchKnowledgeBase, sendSlackAlert } from '../tools/customer-tools.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-demo' });

export async function runSupportTriageAgent(input: { customerId: string; message: string }) {
  const customer = await lookupCustomer(input.customerId);

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a safe support triage agent. You may read CRM data and search docs. You may not issue refunds or export PII.',
      },
      {
        role: 'user',
        content: `Customer: ${JSON.stringify(customer.data)}\nMessage: ${input.message}`,
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'lookup_customer',
          description: 'Read-only CRM lookup for a customer account.',
          parameters: {
            type: 'object',
            properties: {
              customerId: { type: 'string' },
            },
            required: ['customerId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'search_knowledge_base',
          description: 'Read-only search across approved support articles.',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string' },
            },
            required: ['query'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'send_slack_alert',
          description: 'Send a support escalation summary to Slack.',
          parameters: {
            type: 'object',
            properties: {
              channel: { type: 'string' },
              text: { type: 'string' },
            },
            required: ['channel', 'text'],
          },
        },
      },
    ],
  });

  if (input.message.toLowerCase().includes('urgent')) {
    await sendSlackAlert('#support-escalations', `Urgent customer issue: ${input.customerId}`);
  }

  return {
    agent: 'support-triage-agent',
    risk: 'medium',
    customer,
    suggestion: response.choices[0]?.message?.content || 'No triage suggestion generated.',
  };
}

export const supportTriageTools = {
  lookupCustomer,
  searchKnowledgeBase,
  sendSlackAlert,
};
