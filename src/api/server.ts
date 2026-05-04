import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import { runRefundApprovalAgent } from '../agents/refund-approval-agent.js';
import { runResearchAgent } from '../agents/langgraph-research-agent.js';
import { runSupportTriageAgent } from '../agents/support-triage-agent.js';
import { answerWithRag } from '../rag/support-rag.js';
import { lookupCustomer, sendSlackAlert } from '../tools/customer-tools.js';

const app = express();
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'sample-agent-runtime-project' });
});

app.post('/api/support/triage', async (req: Request, res: Response) => {
  const result = await runSupportTriageAgent({
    customerId: String(req.body.customerId || 'cus_demo'),
    message: String(req.body.message || ''),
  });
  res.json(result);
});

app.post('/api/finance/refund-review', async (req: Request, res: Response) => {
  const result = await runRefundApprovalAgent({
    customerId: String(req.body.customerId || 'cus_demo'),
    amountCents: Number(req.body.amountCents || 0),
    reason: String(req.body.reason || 'customer request'),
  });
  res.json(result);
});

app.post('/api/research/rag-answer', async (req: Request, res: Response) => {
  const result = await answerWithRag(String(req.body.question || 'How do refunds work?'));
  res.json(result);
});

app.post('/api/research/langgraph', async (req: Request, res: Response) => {
  const result = await runResearchAgent(String(req.body.question || 'Investigate support incident'));
  res.json(result);
});

app.get('/api/customers/:customerId', async (req: Request, res: Response) => {
  const result = await lookupCustomer(String(req.params.customerId));
  res.json(result);
});

app.post('/api/admin/slack-alert', async (req: Request, res: Response) => {
  const result = await sendSlackAlert(String(req.body.channel || '#ops'), String(req.body.text || 'manual alert'));
  res.json(result);
});

app.post('/webhooks/customer-event', async (req: Request, res: Response) => {
  const event = req.body;
  if (event?.severity === 'critical') {
    await sendSlackAlert('#customer-events', `Critical event for ${event.customerId}`);
  }
  res.json({ received: true });
});

const port = Number(process.env.PORT || 4080);
app.listen(port, () => {
  console.log(`Sample agent runtime API listening on ${port}`);
});
