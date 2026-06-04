const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshot.png' });

  // Simulate typing a message
  await page.fill('[placeholder*="Message"]', 'Hello, how are you?');
  await page.click('button:has-text("Send")');
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'screenshot-with-message.png' });

  await browser.close();
})();
