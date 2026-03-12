import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import type { Book } from '@/app/lib/supabase/types';

type McpSearchPayload = {
  books?: Book[];
};

const DEFAULT_MCP_COMMAND = process.execPath;
const DEFAULT_MCP_ARGS = [path.join(process.cwd(), 'mcp', 'server.mjs')];

const parseArgs = (raw: string | undefined): string[] => {
  if (!raw) return DEFAULT_MCP_ARGS;
  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_MCP_ARGS;
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.map((value) => String(value));
    }
  } catch {
    // fall back to space-separated parsing
  }
  return trimmed.split(/\s+/).filter(Boolean);
};

const getMcpConfig = () => ({
  enabled: process.env.MCP_RECOMMENDATIONS_ENABLED === 'true',
  command: process.env.MCP_SERVER_COMMAND?.trim() || DEFAULT_MCP_COMMAND,
  args: parseArgs(process.env.MCP_SERVER_ARGS),
});

const safeJsonParse = (value: string): McpSearchPayload | null => {
  try {
    return JSON.parse(value) as McpSearchPayload;
  } catch {
    return null;
  }
};

export async function searchBooksViaMcp(
  query: string,
  limit: number,
): Promise<Book[] | null> {
  const config = getMcpConfig();
  if (!config.enabled) return null;

  const client = new Client(
    { name: 'library-recommendations', version: '1.0.0' },
    { capabilities: {} },
  );
  const transport = new StdioClientTransport({
    command: config.command,
    args: config.args,
  });

  try {
    await client.connect(transport);
    const result = await client.request(
      {
        method: 'tools/call',
        params: {
          name: 'search_books',
          arguments: {
            query,
            limit,
          },
        },
      },
      CallToolResultSchema,
    );

    const text =
      result?.content?.find((item) => item.type === 'text')?.text?.trim() ?? '';
    if (!text) return [];

    const payload = safeJsonParse(text);
    if (!payload) return null;
    if (!Array.isArray(payload.books)) return null;
    return payload.books;
  } catch (error) {
    console.warn('[mcp] search failed, falling back to Supabase', error);
    return null;
  } finally {
    try {
      await client.close();
    } catch {
      // ignore close errors
    }
  }
}
