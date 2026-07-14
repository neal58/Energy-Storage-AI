import {readFile} from 'node:fs/promises';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const required=['id="father-surname"','id="mother-surname"','id="birth-date"','id="birth-time"','id="generate"','id="recommendations"','<style>','<script>'];
for(const marker of required){if(!html.includes(marker))throw new Error(`missing standalone marker: ${marker}`);}
if(/<script[^>]+src=/.test(html))throw new Error('standalone HTML must not load external scripts');
if(/type=["']module["']/.test(html))throw new Error('standalone HTML must not use ES modules');
