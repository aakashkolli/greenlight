const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const out = '/tmp/gl-screenshots';
  if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const portCandidates = [3000,3001,3002,3003];
  let origin;
  for (const p of portCandidates) {
    try {
      const res = await page.goto(`http://localhost:${p}/`, { waitUntil: 'domcontentloaded', timeout: 3000 });
      if (res && res.status() < 600) { origin = `http://localhost:${p}`; break; }
    } catch (e) {
      // ignore
    }
  }

  if (!origin) {
    console.error('No running dev server found on ports', portCandidates);
    await browser.close();
    process.exit(2);
  }

  const pages = ['/', '/create', '/activity', '/project/demo-solar-school'];
  for (const p of pages) {
    const url = origin + p;
    try {
      await page.goto(url, { waitUntil: 'networkidle' , timeout: 10000});
      await page.screenshot({ path: `${out}${p === '/' ? '/home.png' : p.replace(/\//g,'_')}.png`, fullPage: true });
      console.log('captured', url);
    } catch (e) {
      console.error('failed', url, e.message);
    }
  }

  await browser.close();
  console.log('screenshots saved to', out);
})();
