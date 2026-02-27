import { chromium } from 'playwright';

async function verifyFileExplorer() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000', { timeout: 60000 });

    // Auth handling - It seems persistent or re-appears.
    // Let's loop a few times to be sure we are past it.
    console.log('Handling Auth...');

    for (let i = 0; i < 3; i++) {
        const guestButton = page.getByText('Continue as guest');
        if (await guestButton.isVisible()) {
            console.log(`Clicking "Continue as guest" (attempt ${i+1})`);
            await guestButton.click({ force: true });
            await page.waitForTimeout(2000);
        } else {
            console.log('Guest button not found');
            break;
        }
    }

    // Check if modal is still there
    const authModal = page.locator('.min-h-screen').first(); // Adjust selector based on image if needed
    // The image shows a centered modal. Class might be generic.
    // But let's assume we are past it or can ignore it if we find the button.

    // Wait for sidebar to be present (it might be behind modal visually but present in DOM)
    console.log('Waiting for sidebar navigation...');
    const nav = page.locator('nav');
    await nav.waitFor({ state: 'attached' });

    // Try to click "Desktop" icon.
    // In `AppLayout`, the sidebar buttons are:
    // Dashboard, Projects, CodeEditor, DesktopWorkspace, DesignStudio...
    // If we click index 3, it should be DesktopWorkspace.

    // If the modal is blocking clicks, we need to force click or evaluate JS.
    console.log('Attempting to click Desktop navigation button...');
    const desktopButton = nav.locator('button').nth(3);

    // Use JS click to bypass overlays if playwright's force doesn't work (though force usually works)
    await desktopButton.evaluate(b => b.click());
    console.log('Clicked Desktop button via JS evaluation');

    await page.waitForTimeout(2000);

    // Now check for "Explorer" text again.
    console.log('Checking for Explorer text...');

    // Wait a bit longer
    await page.waitForTimeout(3000);

    // Screenshot to debug
    await page.screenshot({ path: '.jules/verification/after-nav-click.png' });

    const explorerText = page.locator('text=Explorer');
    if (await explorerText.count() > 0 && await explorerText.first().isVisible()) {
        console.log('Explorer text found!');

        // Take final screenshot
        await page.screenshot({ path: '.jules/verification/explorer-success.png' });

        // Verify src folder
        if (await page.getByText('src').isVisible()) {
            console.log('SUCCESS: src folder visible.');
        }

    } else {
        console.log('Explorer text still not found. Maybe we are not in Desktop view.');
        // Maybe index is wrong?
        // Let's try to print the aria-labels or titles of buttons if they have them.
        const buttons = await nav.locator('button').all();
        console.log(`Found ${buttons.length} buttons.`);
        for (let i = 0; i < buttons.length; i++) {
            const title = await buttons[i].getAttribute('title');
            console.log(`Button ${i}: title="${title}"`);
            if (title && (title.includes('Desktop') || title.includes('Workspace'))) {
                console.log('Found button by title, clicking...');
                await buttons[i].click({ force: true });
                await page.waitForTimeout(2000);
                // Check explorer again...
                if (await explorerText.isVisible()) {
                    console.log('Explorer text found after clicking specific button!');
                    await page.screenshot({ path: '.jules/verification/explorer-success-v3.png' });
                    break;
                }
            }
        }
    }

  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: '.jules/verification/error-final-v3.png' });
  } finally {
    await browser.close();
  }
}

verifyFileExplorer();
