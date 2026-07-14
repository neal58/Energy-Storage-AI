import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('built page loads pinned lunar library and dynamic module',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.ok(html.includes('<style>'));
  assert.ok(html.includes('lunar-javascript@v1.7.7'));
  assert.ok(html.includes('src/dynamic-ui.js'));
  assert.ok(html.includes('id="app"'));
});
