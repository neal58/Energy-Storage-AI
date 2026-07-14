import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('homepage exposes required controls',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  for(const id of ['surname','gender','style','meaning','generate','recommendations','compare']){
    assert.ok(html.includes(`id="${id}"`),`missing ${id}`);
  }
});
