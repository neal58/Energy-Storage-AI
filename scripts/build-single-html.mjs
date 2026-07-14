import{readFile,writeFile}from'node:fs/promises';
const [template,css,engine,ui]=await Promise.all([
 readFile(new URL('../src/template.html',import.meta.url),'utf8'),
 readFile(new URL('../src/styles.css',import.meta.url),'utf8'),
 readFile(new URL('../src/name-engine.cjs',import.meta.url),'utf8'),
 readFile(new URL('../src/name-ui.js',import.meta.url),'utf8')
]);
const html=template.replace('__INLINE_CSS__',css).replace('__INLINE_ENGINE__',engine).replace('__INLINE_UI__',ui);
if(html.includes('__INLINE_'))throw new Error('build placeholders remain');
if(/<script[^>]+src=/.test(html)||/type=["']module["']/.test(html))throw new Error('index must remain standalone');
await writeFile(new URL('../index.html',import.meta.url),html);
