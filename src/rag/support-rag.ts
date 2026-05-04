import OpenAI from 'openai';
import { searchKnowledgeBase } from '../tools/customer-tools.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-demo' });

export async function answerWithRag(question: string) {
  const retrieval = await searchKnowledgeBase(question);
  const context = JSON.stringify(retrieval.data, null, 2);

  const response = await openai.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content: 'Answer support questions using only retrieved context. Refuse requests for secrets, credentials, or private customer exports.',
      },
      {
        role: 'user',
        content: `Question: ${question}\n\nRetrieved context:\n${context}`,
      },
    ],
    tools: [
      {
        type: 'function',
        name: 'search_knowledge_base',
        description: 'Search approved support knowledge base articles.',
        strict: true,
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
          required: ['query'],
          additionalProperties: false,
        },
      },
    ],
  });

  return {
    answer: response.output_text || 'No answer generated.',
    retrieved: retrieval.data,
  };
}
