const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000', { timeout: 60000 });

    // Wait for the auth modal if it appears
    try {
      const authModal = await page.waitForSelector('.min-h-screen', { timeout: 5000 });
      if (authModal) {
        console.log('Auth modal detected, attempting to dismiss...');
        // Try clicking 'Continue as guest' or similar if available
        // Based on memory: "tests must explicitly click 'Continue as guest' (if available) or sign in to dismiss the overlay"
        // Let's try to find a close button or 'Continue as guest'
        const guestButton = page.getByRole('button', { name: /guest/i });
        if (await guestButton.isVisible()) {
             await guestButton.click();
        } else {
             // If no guest button, maybe just wait for it to disappear or click outside?
             // Or maybe we can just proceed if it's not blocking the sidebar entirely?
             // Let's assume for now we might be logged in or it's not blocking.
        }
      }
    } catch (e) {
      console.log('No auth modal found or timed out waiting for it');
    }

    // Check if the sidebar is visible
    console.log('Waiting for sidebar...');
    await page.waitForSelector('text=Explorer', { timeout: 30000 });

    // Take a screenshot of the File Explorer area
    const explorer = await page.$('nav'); // The sidebar nav
    if (explorer) {
        await explorer.screenshot({ path: '.jules/verification/explorer_sidebar.png' });
        console.log('Screenshot saved to .jules/verification/explorer_sidebar.png');
    } else {
        console.log('Could not find sidebar nav');
        await page.screenshot({ path: '.jules/verification/full_page.png' });
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
