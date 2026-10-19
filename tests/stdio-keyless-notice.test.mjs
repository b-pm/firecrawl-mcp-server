import assert from 'node:assert/strict';
import test from 'node:test';
import { startStdio } from './helpers/exchange-mcp.mjs';

test('stdio OAuth token is not mislabeled as keyless', async (t) => {
  const { client, getStderr } = await startStdio(t, {
    FIRECRAWL_API_KEY: '',
    FIRECRAWL_API_URL: '',
    FIRECRAWL_OAUTH_TOKEN: 'fco-test-token',
  });
  await client.request('tools/list', {});
  assert.doesNotMatch(getStderr(), /running in keyless mode/i);
});

test('stdio without a credential still reports keyless mode', async (t) => {
  const { client, getStderr } = await startStdio(t, {
    FIRECRAWL_API_KEY: '',
    FIRECRAWL_API_URL: '',
    FIRECRAWL_OAUTH_TOKEN: '',
  });
  await client.request('tools/list', {});
  assert.match(getStderr(), /running in keyless mode/i);
  assert.match(getStderr(), /firecrawl_parse/);
});
