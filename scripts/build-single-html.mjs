import {readFile,writeFile} from 'node:fs/promises';
const [template,css]=await Promise.all([
  readFile(new URL('../src/template.html',import.meta.url),'utf8'),
  readFile(new URL('../src/styles.css',import.meta.url),'utf8')
]);
const moduleUrl='https://cdn.jsdelivr.net/gh/neal58/Energy-Storage-AI@main/src/dynamic-ui.js';
const html=template.replace('__INLINE_CSS__',css).replace('__APP_MODULE__',moduleUrl);
if(html.includes('__INLINE_')||html.includes('__APP_MODULE__'))throw new Error('build placeholders remain');
await writeFile(new URL('../index.html',import.meta.url),html);
