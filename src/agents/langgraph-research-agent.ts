import { StateGraph, START, END } from '@langchain/langgraph';
import { searchKnowledgeBase, sendSlackAlert } from '../tools/customer-tools.js';

type ResearchState = {
  question: string;
  notes?: string;
  escalation?: string;
};

async function retrieve(state: ResearchState): Promise<Partial<ResearchState>> {
  const docs = await searchKnowledgeBase(state.question);
  return { notes: JSON.stringify(docs.data) };
}

async function escalate(state: ResearchState): Promise<Partial<ResearchState>> {
  if (!state.question.toLowerCase().includes('incident')) return {};
  await sendSlackAlert('#incident-review', `Research agent found incident context: ${state.question}`);
  return { escalation: 'incident-review' };
}

const graph = new StateGraph<ResearchState>({
  channels: {
    question: null,
    notes: null,
    escalation: null,
  },
})
  .addNode('retrieve', retrieve)
  .addNode('escalate', escalate)
  .addEdge(START, 'retrieve')
  .addEdge('retrieve', 'escalate')
  .addEdge('escalate', END);

export const researchAgent = graph.compile();

export async function runResearchAgent(question: string) {
  return researchAgent.invoke({ question });
}
