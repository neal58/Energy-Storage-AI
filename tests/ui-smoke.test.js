import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('dynamic interface exposes family, birth and naming controls',async()=>{
  const source=await readFile(new URL('../src/dynamic-ui.js',import.meta.url),'utf8');
  for(const id of [
    'father-surname','mother-surname','surname-mode','maternal-mode','gender','name-length',
    'birth-date','birth-time','timezone','traditional-reference','style','meaning',
    'required-char','avoid-chars','custom-taboos','generate','recommendations','birth-summary'
  ]){
    assert.ok(source.includes(`id="${id}"`),`missing ${id}`);
  }
});
