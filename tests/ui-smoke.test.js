import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('book-grounded interface exposes intent, family and constraint controls',async()=>{
  const source=await readFile(new URL('../src/template.html',import.meta.url),'utf8');
  for(const id of [
    'father-surname','mother-surname','surname-mode','maternal-mode','gender',
    'generation-char','generation-position','elder-taboo-chars','naming-method','family-wish',
    'birth-date','birth-time','timezone','traditional-reference','style','meaning',
    'required-char','avoid-chars','custom-taboos','generate','naming-brief','recommendations','birth-summary'
  ]){
    assert.ok(source.includes(`id="${id}"`),`missing ${id}`);
  }
  for(const route of ['信｜出生纪念','义｜德行志向','象｜气质人格','假｜自然意象','类｜家族呼应']){
    assert.ok(source.includes(route),`missing route ${route}`);
  }
});
