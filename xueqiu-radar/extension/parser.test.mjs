import assert from 'node:assert/strict';

function parseCount(value){
  const s=String(value??'').trim().toLowerCase().replace(/,/g,'');
  const m=s.match(/([\d.]+)\s*(万|w|k)?/);
  if(!m)return 0;
  const n=Number(m[1])||0;
  return Math.round(n*((m[2]==='万'||m[2]==='w')?10000:m[2]==='k'?1000:1));
}

assert.equal(parseCount('1.2万'),12000);
assert.equal(parseCount('8.5w'),85000);
assert.equal(parseCount('12,345'),12345);
console.log('parser tests passed');