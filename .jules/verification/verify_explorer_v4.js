import { chromium } from 'playwright';

async function verifyFileExplorer() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000', { timeout: 60000 });

    // Auth handling - Updated based on error screenshot
    // The previous error was "subtree intercepts pointer events" - the auth modal is blocking everything.
    // We need to dismiss it properly.
    console.log('Handling Auth Modal...');
    await page.waitForTimeout(2000); // Wait for animation

    // Try "Continue as guest" first - it is visible in the screenshot at the bottom
    try {
        const guestButton = page.getByText('Continue as guest');
        // Force click because sometimes overlays are tricky
        await guestButton.click({ force: true, timeout: 5000 });
        console.log('Clicked "Continue as guest"');
    } catch (e) {
        console.log('Could not click "Continue as guest":', e.message);
        // Fallback: Click the close 'x' button in top right of modal
        try {
            await page.locator('.fixed button').first().click({ force: true });
            console.log('Clicked close button');
        } catch (e2) {
            console.log('Could not close modal');
        }
    }

    await page.waitForTimeout(2000); // Wait for modal to disappear

    console.log('Navigating to Desktop view...');
    // We are likely on Dashboard now.
    // Try to click sidebar button index 3 again.
    const sidebarButtons = page.locator('nav button');
    if (await sidebarButtons.count() > 0) {
        await sidebarButtons.nth(3).click({ force: true });
        console.log('Clicked 4th sidebar button.');
        await page.waitForTimeout(2000);
    }

    console.log('Checking for Desktop view...');
    // Check for "Explorer" text
    try {
        await page.waitForSelector('text=Explorer', { timeout: 10000 });
        console.log('Explorer text found!');

        await page.screenshot({ path: '.jules/verification/explorer-success.png' });

        // Final verification of src folder
        if (await page.getByText('src').isVisible()) {
            console.log('SUCCESS: src folder found in File Explorer.');
        } else {
            console.log('Explorer loaded but src not visible (maybe collapsed?)');
        }

    } catch (e) {
        console.log('Explorer text not found.');
        await page.screenshot({ path: '.jules/verification/failed-nav-v3.png' });
    }

  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: '.jules/verification/error-final.png' });
  } finally {
    await browser.close();
  }
}

verifyFileExplorer();
