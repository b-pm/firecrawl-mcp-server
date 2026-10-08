import assert from 'node:assert/strict';
import test from 'node:test';
import { startStdioWithApi } from './helpers/exchange-mcp.mjs';

test('firecrawl_scrape forwards bounded PDF parser options for URL documents', async (t) => {
  const { api, client } = await startStdioWithApi(t);

  const urls = [
    'https://example.com/report.pdf',
    'https://example.com/download/report',
  ];

  for (const url of urls) {
    const result = await client.request('tools/call', {
      name: 'firecrawl_scrape',
      arguments: {
        url,
        parsers: ['pdf'],
        pdfOptions: { maxPages: 5 },
      },
    });
    assert.notEqual(result.isError, true, JSON.stringify(result));
  }

  const requests = api.requests.filter(
    (request) => request.method === 'POST' && request.url === '/v2/scrape'
  );
  assert.equal(requests.length, urls.length);

  for (const [index, request] of requests.entries()) {
    assert.equal(request.body.url, urls[index]);
    assert.deepEqual(
      request.body.formats.find(
        (format) => typeof format === 'object' && format?.type === 'pdf'
      ),
      { type: 'pdf', maxPages: 5 }
    );
    assert.equal('parsers' in request.body, false);
    assert.equal('pdfOptions' in request.body, false);
  }
});
