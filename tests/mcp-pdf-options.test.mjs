import assert from 'node:assert/strict';
import test from 'node:test';
import { startStdioWithApi, toolText } from './helpers/exchange-mcp.mjs';

test('bounded PDF and extensionless document reads forward maxPages and preserve nested usage', async (t) => {
  const { api, client } = await startStdioWithApi(t, {
    largeResult: {
      success: true,
      data: { markdown: '# Partial document', metadata: { creditsUsed: 5 } },
    },
  });

  for (const url of [
    'https://example.com/report.pdf',
    'https://example.com/document/123',
  ]) {
    const response = await client.request('tools/call', {
      name: 'firecrawl_scrape',
      arguments: {
        url,
        formats: ['markdown'],
        parsers: ['pdf'],
        pdfOptions: { maxPages: 5 },
      },
    });

    const result = toolText(response);
    assert.deepEqual(api.requests.at(-1).body.parsers, [
      { type: 'pdf', maxPages: 5 },
    ]);
    assert.equal(result.metadata.creditsUsed, 5);
    assert.equal(response.structuredContent.metadata.creditsUsed, 5);
  }
});
