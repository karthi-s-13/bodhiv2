const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));

  const shotDir = 'C:/Users/karth/AppData/Local/Temp/claude/c--download-bodhi-v2/633c8a8f-7365-4e2b-8276-6e55be9dcd77/scratchpad';

  await page.goto('http://localhost:5173/preview.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Good Morning', { timeout: 15000 });
  await page.screenshot({ path: `${shotDir}/01-dashboard.png` });

  await page.click('text=My Textbooks');
  await page.waitForSelector('text=View Curriculum Map');
  await page.screenshot({ path: `${shotDir}/02-library.png` });

  const scienceCard = page.locator('.textbook-card-item', { hasText: 'Science Textbook' }).first();
  await scienceCard.locator('text=View Curriculum Map').click();
  await page.waitForSelector('text=Table of Contents');
  await page.screenshot({ path: `${shotDir}/03-detail-initial-tab.png` });

  await page.click('.viewer-tab-btn:has-text("Curriculum Map")');
  await page.waitForSelector('text=Visualize the structure');
  await page.screenshot({ path: `${shotDir}/04-curriculum-default.png` });

  await page.click('text=Crop Production & Management');
  await page.waitForSelector('text=Agricultural Practices');
  await page.click('text=Agricultural Practices');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shotDir}/05-curriculum-agri.png`, fullPage: true });

  console.log('CONSOLE_ERRORS:', JSON.stringify(errors));
  await browser.close();
})().catch((e) => { console.error('SCRIPT_ERROR', e); process.exit(1); });
