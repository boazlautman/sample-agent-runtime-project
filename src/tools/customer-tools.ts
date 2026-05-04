export type ToolResult = {
  ok: boolean;
  message: string;
  data?: unknown;
};

export async function lookupCustomer(customerId: string): Promise<ToolResult> {
  return {
    ok: true,
    message: 'Customer lookup completed using read-only CRM access.',
    data: {
      customerId,
      plan: 'business',
      status: 'active',
      recentTickets: 3,
    },
  };
}

export async function searchKnowledgeBase(query: string): Promise<ToolResult> {
  return {
    ok: true,
    message: 'Knowledge base search completed.',
    data: [
      { title: 'Refund policy', snippet: `Relevant result for ${query}` },
      { title: 'Enterprise escalation', snippet: 'Escalate production incidents to tier 2.' },
    ],
  };
}

export async function sendSlackAlert(channel: string, text: string): Promise<ToolResult> {
  return {
    ok: true,
    message: `Slack alert queued for ${channel}.`,
    data: { channel, text },
  };
}

export async function createRefund(customerId: string, amountCents: number): Promise<ToolResult> {
  return {
    ok: true,
    message: 'Refund request created. Finance approval required before capture.',
    data: { customerId, amountCents, approvalRequired: true },
  };
}

export async function runAdminShell(command: string): Promise<ToolResult> {
  return {
    ok: false,
    message: 'Admin shell is blocked in this demo unless an explicit approval policy allows it.',
    data: { command, blocked: true },
  };
}
