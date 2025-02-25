import { logger } from '@/libs/Logger';
import { NextResponse } from 'next/server';
import { langchainInvoke } from './langchain';
import { waitUntil } from '@vercel/functions';

export const POST = async (request: Request) => {
  console.log("MONOCLE_EXPORTER")
  console.log(process.env.MONOCLE_EXPORTER)
  const sessionId = request.headers.get('X-Session-Id');
  logger.info(`Processing request for session: ${sessionId}`);
  process.env["MONOCLE_S3_KEY_PREFIX_CURRENT"] = sessionId ? sessionId + "__" : ""

  const json = await request.json()
  console.log("Request:", json.message);

  const llmResponse = await langchainInvoke(json.message);

  console.log("Response from llm:", llmResponse);

  waitUntil(new Promise(resolve => setTimeout(resolve, 3000)));

  return NextResponse.json({
    message: {
      role: "assistant",
      content: [
        {
          text: llmResponse
        }
      ]
    }
  });
};
