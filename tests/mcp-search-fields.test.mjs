import assert from 'node:assert/strict';
import test from 'node:test';
import { startStdioWithApi, toolText } from './helpers/exchange-mcp.mjs';

test('firecrawl_search publishes and forwards country, timeout, and ignoreInvalidURLs', async (t) => {
  const { api, client } = await startStdioWithApi(t);
  const { tools } = await client.request('tools/list', {});
  const search = tools.find((tool) => tool.name === 'firecrawl_search');
  assert.ok(search, 'firecrawl_search missing');

  for (const field of ['country', 'timeout', 'ignoreInvalidURLs']) {
    assert.ok(search.inputSchema?.properties?.[field], `${field} missing from published search schema`);
  }

  const result = await client.request('tools/call', {
    name: 'firecrawl_search',
    arguments: {
      query: 'restaurants',
      sources: ['web'],
      country: 'DE',
      timeout: 30_000,
      ignoreInvalidURLs: true,
      limit: 5,
    },
  });

  assert.notEqual(result.isError, true, JSON.stringify(result));
  toolText(result);

  const request = api.requests.find((candidate) => candidate.url === '/v2/search');
  assert.ok(request, 'search request missing');
  assert.equal(request.body.country, 'DE');
  assert.equal(request.body.timeout, 30_000);
  assert.equal(request.body.ignoreInvalidURLs, true);
  assert.equal(request.body.limit, 5);
});

test('firecrawl_search rejects non-positive timeout before calling the API', async (t) => {
  const { api, client } = await startStdioWithApi(t);

  let rejected = false;
  try {
    const result = await client.request('tools/call', {
      name: 'firecrawl_search',
      arguments: {
        query: 'restaurants',
        sources: ['web'],
        timeout: 0,
      },
    });
    rejected = result.isError === true;
  } catch {
    rejected = true;
  }

  assert.equal(rejected, true);
  assert.equal(api.requests.length, 0);
});
