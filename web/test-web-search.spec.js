import { chromium } from '@playwright/test';

(async () => {
  // Use Google Chrome instead of Chromium
  const browser = await chromium.launch({
    headless: false,
    devtools: true,
    channel: 'chrome' // Use Google Chrome
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => {
    console.log(`[Browser ${msg.type()}]:`, msg.text());
  });

  page.on('pageerror', error => {
    console.error('[Page Error]:', error);
  });

  console.log('Navigating to app...');
  await page.goto('http://localhost:8000');

  // Wait for app to load
  await page.waitForLoadState('networkidle');
  console.log('App loaded');

  // Select SmolLM model (smaller and faster)
  const modelSelector = await page.locator('button:has-text("Select Model")');
  if (await modelSelector.isVisible()) {
    await modelSelector.click();
    await page.waitForTimeout(500);

    // Click on SmolLM if available
    const smolOption = await page.locator('text=SmolLM2 135M');
    if (await smolOption.isVisible()) {
      await smolOption.click();
      console.log('Selected SmolLM2 model');
      await page.waitForTimeout(1000);
    }
  }

  // Wait for model initialization - monitor download progress
  console.log('Waiting for model to download and initialize...');

  // Poll for status updates
  let lastStatus = '';
  const checkStatus = async () => {
    try {
      const status = await page.textContent('[class*="text-xs"]');
      if (status && status !== lastStatus) {
        console.log('Status:', status);
        lastStatus = status;
      }
      // Check for various ready states
      return status && (status.includes('Ready') || status.includes('Phi-3.5'));
    } catch (e) {
      return false;
    }
  };

  // Wait up to 10 minutes for model download and initialization
  const maxWaitTime = 600000; // 10 minutes
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    if (await checkStatus()) {
      console.log('Model is ready!');
      break;
    }
    await page.waitForTimeout(1000); // Check every second
  }

  if (Date.now() - startTime >= maxWaitTime) {
    console.log('Timeout waiting for model initialization');
    throw new Error('Model initialization timeout');
  }

  const initStatus = await page.textContent('[class*="text-xs"]');
  console.log('Init status:', initStatus);

  // Wait a bit more to ensure everything is settled
  await page.waitForTimeout(2000);

  // Type a web search query
  const searchQuery = 'what is the current weather in San Francisco';
  console.log('Typing search query:', searchQuery);

  const textarea = await page.locator('textarea[placeholder*="Type a message"]');
  await textarea.fill(searchQuery);

  // Submit the query
  console.log('Submitting query...');
  await page.keyboard.press('Enter');

  // Wait for response and monitor console
  console.log('Waiting for response...');
  await page.waitForTimeout(10000);

  // Get all messages
  const messages = await page.locator('[class*="prose"]').allTextContents();
  console.log('\n=== Messages Found ===');
  messages.forEach((msg, i) => {
    console.log(`Message ${i + 1}:`, msg.substring(0, 200));
  });

  // Keep browser open for inspection
  console.log('\nTest complete. Browser will remain open for inspection.');
  console.log('Press Ctrl+C to exit.');

  // Keep process alive
  await new Promise(() => {});
})();