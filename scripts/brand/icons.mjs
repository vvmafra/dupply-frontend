import { chromium } from 'playwright';
import { fileURLToPath } from 'url'; import path from 'path';
import fs from 'fs';
const here=path.dirname(fileURLToPath(import.meta.url)); const dir=path.resolve(here,'..','..','public','brand'); const b=await chromium.launch();
for (const [svg,size,out] of [['favicon.svg',32,'favicon-32.png'],['favicon.svg',16,'favicon-16.png'],['app-icon.svg',180,'apple-touch-icon.png'],['app-icon.svg',512,'icon-512.png'],['app-icon.svg',192,'icon-192.png']]){
  fs.writeFileSync(`${dir}/icon-${size}.html`,`<body style="margin:0;background:transparent"><img src="${svg}" style="width:${size}px;height:${size}px;display:block"></body>`);
  const p=await b.newPage({viewport:{width:size,height:size}}); await p.goto(`file://${dir}/icon-${size}.html`); await p.waitForTimeout(150);
  await p.screenshot({path:`${dir}/${out}`,omitBackground:true}); await p.close(); fs.unlinkSync(`${dir}/icon-${size}.html`);
}
const p=await b.newPage({viewport:{width:1200,height:630}}); await p.goto('file://'+here+'/og.html'); await p.waitForTimeout(200); await p.screenshot({path:`${dir}/og-image.png`}); await p.close();
await b.close(); console.log('icons ok');
