import { chromium } from 'playwright';

async function verifyFileExplorer() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000', { timeout: 60000 });

    // Auth handling
    console.log('Checking for auth modal...');
    try {
      // "Continue as guest" is often available
      const guestButton = page.getByText('Continue as guest');
      if (await guestButton.isVisible({ timeout: 5000 })) {
          console.log('Clicking "Continue as guest"...');
          await guestButton.click();
      } else {
          // If no text match, try aria-label
          const closeButton = page.locator('button[aria-label="Close"]');
          if (await closeButton.isVisible({ timeout: 2000 })) {
             await closeButton.click();
          }
      }
    } catch (e) {
      console.log('Auth check skipped:', e.message);
    }

    // Wait for the main layout to stabilize.
    // The previous screenshot showed a loading spinner/logo in the center.
    // This implies lazy loading of the Dashboard.
    console.log('Waiting for initial view to load...');
    try {
        // Wait for anything that isn't the loading screen
        // The dashboard usually has "Welcome" or "Projects" or cards.
        // Let's wait a bit longer for the suspense fallback to resolve.
        await page.waitForTimeout(5000);
    } catch (e) {}

    console.log('Attempting to navigate to Desktop view...');
    // We need to bypass the Dashboard and go to the Desktop workspace.
    // Memory says: "The `App.tsx` passes a navigation callback (`handleRestrictedAccess`) to the `Projects` view... allows it to trigger a view transition to `DesktopWorkspace`"

    // Let's try to find a navigation bar.
    // Inspecting `AppLayout` (from memory) it renders a Sidebar.
    // Icons: 'dashboard', 'folder', 'code', 'desktop_windows' (maybe?)
    // Let's blindly click likely locations for the Sidebar if we can't find selectors.
    // Sidebar is usually on the left.
    // Let's try to click the "Code" or "Desktop" icon.
    // Common material icons: 'code', 'terminal', 'computer', 'desktop_mac'.

    // Let's try to find any button in the sidebar.
    const sidebarButtons = page.locator('nav button');
    if (await sidebarButtons.count() > 0) {
        console.log(`Found ${await sidebarButtons.count()} sidebar buttons.`);
        // Try clicking them one by one until we see "Explorer"?
        // Or specific index. usually:
        // 0: Dashboard
        // 1: Projects
        // 2: Code Editor
        // 3: Desktop Workspace (maybe?)

        // Let's try index 3 (4th button)
        await sidebarButtons.nth(3).click();
        console.log('Clicked 4th sidebar button.');
        await page.waitForTimeout(2000);
    }

    // If we are in Desktop View, we should see "Explorer" text in the sidebar.
    console.log('Checking for Desktop view...');
    const explorerText = page.locator('text=Explorer');
    if (await explorerText.isVisible()) {
        console.log('Explorer text found! We are in Desktop view.');

        // Take screenshot of the File Explorer
        await page.screenshot({ path: '.jules/verification/explorer-success.png' });

        // Verify we can see 'src'
        if (await page.getByText('src').isVisible()) {
            console.log('Found src folder.');
        } else {
            console.log('src folder not visible immediately.');
        }
    } else {
        console.log('Explorer text not found. Trying another navigation...');
        // Maybe try the "Projects" view first
        const projectsText = page.getByText('Projects');
        if (await projectsText.isVisible()) {
             // Click a project template
             console.log('In Projects view, clicking a template...');
             const template = page.locator('text=React').first();
             if (await template.isVisible()) {
                 await template.click();
                 await page.waitForTimeout(3000);
             }
        }

        // Check again
        if (await explorerText.isVisible()) {
             console.log('Explorer text found after navigation!');
             await page.screenshot({ path: '.jules/verification/explorer-success-v2.png' });
        } else {
             console.log('Failed to reach Desktop view.');
             await page.screenshot({ path: '.jules/verification/failed-nav.png' });
        }
    }

  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: '.jules/verification/error-nav.png' });
  } finally {
    await browser.close();
  }
}

verifyFileExplorer();
