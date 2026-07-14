import test from 'node:test';
import assert from 'node:assert/strict';
import { NAME_CANDIDATES } from '../src/data/names.js';

test('curated knowledge base has valid candidates',()=>{
  assert.ok(NAME_CANDIDATES.length>=30);
  for(const item of NAME_CANDIDATES){
    assert.equal(item.name.length,2);
    assert.equal(item.pinyin.length,2);
    assert.equal(item.tones.length,2);
    assert.ok(item.naturalness>=0&&item.naturalness<=100);
    assert.ok(item.semanticCoherence>=0&&item.semanticCoherence<=100);
    if(item.source) assert.equal(item.sourceVerified,true);
  }
});
