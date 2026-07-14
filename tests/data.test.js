import test from 'node:test';
import assert from 'node:assert/strict';
import {NAME_CANDIDATES} from '../src/data/names.js';

test('curated knowledge base contains only complete usable candidates',()=>{
  assert.ok(NAME_CANDIDATES.length>=30);
  for(const item of NAME_CANDIDATES){
    assert.equal(item.name.length,2);
    assert.equal(item.pinyin.length,2);
    assert.equal(item.tones.length,2);
    assert.ok(item.natural>=90&&item.natural<=100,`${item.name} naturalness`);
    assert.ok(item.semantic>=90&&item.semantic<=100,`${item.name} semantics`);
    assert.ok(item.adult>=90&&item.adult<=100,`${item.name} adult fit`);
    assert.ok(item.writing>=0&&item.writing<=100,`${item.name} writing`);
    assert.ok(item.meaningText.length>0,`${item.name} missing explanation`);
    if(item.source)assert.equal(item.sourceVerified,true);
  }
});
