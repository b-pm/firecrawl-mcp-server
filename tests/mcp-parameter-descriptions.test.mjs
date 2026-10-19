import assert from 'node:assert/strict';
import test from 'node:test';
import { startStdioWithApi } from './helpers/exchange-mcp.mjs';

function requireTool(tools, name) {
  const tool = tools.find((item) => item.name === name);
  assert.ok(tool, `${name} missing`);
  return tool;
}

function requireDescriptions(properties, names, prefix) {
  for (const name of names) {
    const schema = properties?.[name];
    assert.ok(schema, `${prefix}.${name} missing`);
    assert.ok(typeof schema.description === 'string' && schema.description.trim(), `${prefix}.${name} needs a description`);
  }
}

test('high-frequency scrape and search parameters publish descriptions', async (t) => {
  const { client } = await startStdioWithApi(t);
  const { tools } = await client.request('tools/list', {});

  const scrape = requireTool(tools, 'firecrawl_scrape');
  requireDescriptions(scrape.inputSchema?.properties, [
    'url','formats','jsonOptions','queryOptions','screenshotOptions','parsers','pdfOptions',
    'onlyMainContent','redactPII','includeTags','excludeTags','waitFor','mobile',
    'skipTlsVerification','removeBase64Images','location','storeInCache','zeroDataRetention',
    'maxAge','lockdown','proxy','profile'
  ], 'firecrawl_scrape');
  requireDescriptions(scrape.inputSchema?.properties?.jsonOptions?.properties, ['prompt','schema'], 'firecrawl_scrape.jsonOptions');
  requireDescriptions(scrape.inputSchema?.properties?.queryOptions?.properties, ['prompt','mode'], 'firecrawl_scrape.queryOptions');
  requireDescriptions(scrape.inputSchema?.properties?.screenshotOptions?.properties, ['fullPage','quality','viewport'], 'firecrawl_scrape.screenshotOptions');
  requireDescriptions(scrape.inputSchema?.properties?.location?.properties, ['country','languages'], 'firecrawl_scrape.location');

  const search = requireTool(tools, 'firecrawl_search');
  requireDescriptions(search.inputSchema?.properties, ['limit','tbs','filter','location','enterprise'], 'firecrawl_search');
});
