const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const DSF = 1080 / 390;
  const c = await b.newContext({ viewport: { width: 390, height: 693 }, deviceScaleFactor: DSF });
  const p = await c.newPage();
  await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: out + '/seal.png' });
  await p.click('#sealBtn');
  await p.waitForTimeout(450); await p.screenshot({ path: out + '/crack.png' });
  await p.waitForTimeout(6000);
  // hamma bo'limlarni ochiq holatga keltiramiz, ip to'liq chizilsin, xarita yuklansin
  await p.evaluate(async () => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += 300) { scrollTo(0, y); await sleep(60); }
    await sleep(3500); scrollTo(0, 0); await sleep(800);
  });
  // sanoq raqamlari animatsiyasi tugasin
  await p.waitForTimeout(1500);
  const marks = await p.evaluate(() => {
    const top = el => Math.round((el.getBoundingClientRect().top + scrollY));
    return {
      card: top(document.querySelector('#taklif .card')),
      taklif: top(document.getElementById('taklif')),
      sanoq: top(document.getElementById('sanoq')),
      kalendar: top(document.getElementById('kalendar')),
      manzil: top(document.getElementById('manzil')),
      total: document.documentElement.scrollHeight
    };
  });
  await p.addStyleTag({ content: '.toast,.music{display:none!important}' });
  await p.screenshot({ path: out + '/full.png', fullPage: true });
  // fullPage skrinshotda xarita iframe'i chizilmaydi — manzilni alohida, oddiy ekran bilan olamiz
  await p.evaluate(y => scrollTo(0, y), marks.manzil);
  await p.waitForTimeout(3500);
  await p.screenshot({ path: out + '/manzil.png' });
  require('fs').writeFileSync(out + '/marks.json', JSON.stringify({ ...marks, dsf: DSF }));
  console.log(JSON.stringify(marks));
  await b.close();
})();
