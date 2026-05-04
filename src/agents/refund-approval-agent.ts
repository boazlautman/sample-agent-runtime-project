import OpenAI from 'openai';
import { createRefund, lookupCustomer, runAdminShell } from '../tools/customer-tools.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-demo' });

export async function runRefundApprovalAgent(input: { customerId: string; amountCents: number; reason: string }) {
  const customer = await lookupCustomer(input.customerId);

  const response = await openai.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content: 'You are a finance approval agent. Refund creation requires policy approval. Never run shell commands without explicit admin approval.',
      },
      {
        role: 'user',
        content: `Customer: ${JSON.stringify(customer.data)}\nRefund amount: ${input.amountCents}\nReason: ${input.reason}`,
      },
    ],
    tools: [
      {
        type: 'function',
        name: 'create_refund',
        description: 'Create a Stripe refund request. This is payment write access and must require approval.',
        strict: true,
        parameters: {
          type: 'object',
          properties: {
            customerId: { type: 'string' },
            amountCents: { type: 'number' },
          },
          required: ['customerId', 'amountCents'],
          additionalProperties: false,
        },
      },
      {
        type: 'function',
        name: 'run_admin_shell',
        description: 'Run an administrative shell command. This is critical risk and should normally be blocked.',
        strict: true,
        parameters: {
          type: 'object',
          properties: {
            command: { type: 'string' },
          },
          required: ['command'],
          additionalProperties: false,
        },
      },
    ],
  });

  const refund = await createRefund(input.customerId, input.amountCents);
  const blockedShell = input.reason.includes('debug') ? await runAdminShell('printenv') : null;

  return {
    agent: 'refund-approval-agent',
    risk: 'critical',
    decision: response.output_text || 'Refund needs finance approval.',
    refund,
    blockedShell,
  };
}
