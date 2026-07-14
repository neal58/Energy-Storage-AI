import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('root page is standalone and includes the book-grounded engine',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.ok(html.includes('<style>'));
  assert.ok(html.includes('<script>'));
  for(const marker of ['id="father-surname"','id="naming-method"','id="family-wish"','id="generation-char"','id="elder-taboo-chars"','id="naming-brief"','id="generate"']){
    assert.ok(html.includes(marker),`missing ${marker}`);
  }
  assert.ok(html.includes('HaoMingBookEngine'));
  assert.ok(!/<script[^>]+src=/.test(html));
  assert.ok(!/type=["']module["']/.test(html));
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match=>match[1]);
  assert.ok(scripts.length>=3);
  for(const source of scripts)assert.doesNotThrow(()=>new Function(source));
});
