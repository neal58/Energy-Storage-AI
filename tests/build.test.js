import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('root page is fully standalone and contains dynamic controls',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.ok(html.includes('<style>'));
  assert.ok(html.includes('<script>'));
  assert.ok(html.includes('id="father-surname"'));
  assert.ok(html.includes('id="birth-date"'));
  assert.ok(html.includes('id="generate"'));
  assert.ok(!/<script[^>]+src=/.test(html));
  assert.ok(!/type=["']module["']/.test(html));
});
