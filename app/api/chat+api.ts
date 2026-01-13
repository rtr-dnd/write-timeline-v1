import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Request Body:', JSON.stringify(body, null, 2));

    const { messages, projectContent }: { messages: UIMessage[]; projectContent: string } = body;

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = streamText({
      model: "openai/gpt-5.2-chat",
      messages: await convertToModelMessages([...messages]),
      stopWhen: stepCountIs(5),
      tools: {
        readProjectContent: tool({
          description: 'Read the content of the project the user is currently working on',
          inputSchema: z.object({}),
          execute: async () => {
            return {
              content: projectContent,
            };
          },
        }),
        updateProjectContent: tool({
          description: 'Update the content of the project. Use this when the user asks to rewrite, edit, or change the project text.',
          inputSchema: z.object({
            content: z.string().describe('The new full content of the project.'),
          }),
          execute: async ({ content }) => {
            return {
              success: true,
              message: "Content update request received",
            };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'none',
        'X-Content-Type-Options': 'nosniff',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive',
        'X-Vercel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: (error as Error).message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}