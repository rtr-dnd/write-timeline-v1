import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages, projectContent }: { messages: UIMessage[]; projectContent: string } = await req.json();

  const result = streamText({
    model: "openai/gpt-5.2-chat",
    messages: await convertToModelMessages(messages),
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
      'X-Content-Type-Options': 'nosniff'
    },
  });
}