import { chromium } from 'playwright';
import { fileURLToPath } from 'url'; import path from 'path';
const here = path.dirname(fileURLToPath(import.meta.url)); const root = path.resolve(here, '..', '..');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1123, height: 794 }, deviceScaleFactor: 2 });
await p.goto('file://' + path.join(here, 'out', 'brand-book.html')); await p.waitForTimeout(600);
await p.pdf({ path: path.join(root, 'public', 'brand', 'dupply-brand-book.pdf'), format: 'A4', landscape: true, printBackground: true, preferCSSPageSize: true });
const pages = await p.$$('section.page');
for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(here, 'out', `page-${String(i + 1).padStart(2, '0')}.png`) });
await b.close(); console.log('brand book: public/brand/dupply-brand-book.pdf,', pages.length, 'páginas');
