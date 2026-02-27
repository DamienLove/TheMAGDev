import { chromium } from 'playwright';

async function verifyFileExplorer() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000', { timeout: 60000 });

    // Auth handling
    console.log('Handling Auth Modal...');
    await page.waitForTimeout(2000);

    try {
        const guestButton = page.getByText('Continue as guest');
        await guestButton.click({ force: true, timeout: 5000 });
        console.log('Clicked "Continue as guest"');
    } catch (e) {
        console.log('Could not click "Continue as guest".');
    }

    await page.waitForTimeout(2000);

    console.log('Navigating to Desktop view...');
    // Using a more robust selector if possible, but fallback to index 3.
    // The previous timeout suggests button might not be interactable or wrong index.
    // Let's try locating by Icon class if possible.
    // material-symbols-rounded text-[24px]
    // The Desktop one likely has "folder" or "code" icon.
    // Actually, `DesktopWorkspace` (View.Desktop) is what we want.
    // The sidebar in `AppLayout` has icons.

    // Let's try to just use the index approach again but with more waiting/debug.
    const sidebarButtons = page.locator('nav button');
    // Wait for sidebar to be visible
    await page.waitForSelector('nav', { timeout: 10000 });

    if (await sidebarButtons.count() > 0) {
        // Log all buttons for debugging if needed
        // await sidebarButtons.nth(3).click();

        // Wait, "Desktop" view in `App.tsx` corresponds to `View.Desktop`.
        // If we are guest, `handleRestrictedAccess` might block us if we don't have Pro.
        // Memory: "Access restrictions in `App.tsx` (`handleRestrictedAccess`) have been temporarily relaxed to allow guest users to access `View.Desktop` and `View.Build` for showcase purposes."
        // So it should work.

        // Let's try clicking the Project view (index 1 usually) then a template.
        // Or directly Desktop (index 3?).

        // Let's try to click the button that looks like a "Desktop" or "Code" icon.
        // <span class="material-symbols-rounded ...">terminal</span> or similar.

        // Let's just click the 4th button again, but ensure it's visible.
        const btn = sidebarButtons.nth(3);
        await btn.waitFor({ state: 'visible' });
        await btn.click();
        console.log('Clicked 4th sidebar button.');

        // Also try clicking the 2nd button (Projects) as fallback
        // await sidebarButtons.nth(1).click();
    }

    console.log('Checking for Desktop view...');
    // We are looking for "Explorer" text.
    // In our modified component: <span ...>Explorer</span>

    // Wait a bit for transition
    await page.waitForTimeout(2000);

    const explorerText = page.locator('text=Explorer');
    if (await explorerText.isVisible()) {
        console.log('Explorer text found!');
        await page.screenshot({ path: '.jules/verification/explorer-success.png' });

        // Verify we can see 'src' folder
        if (await page.getByText('src').isVisible()) {
             console.log('SUCCESS: src folder found.');

             // Try to expand it (it might be expanded by default in our code)
             // "expandedFolders" state in FileExplorer.tsx is initialized with /src

             // Check if 'components' is visible
             if (await page.getByText('components').isVisible()) {
                 console.log('SUCCESS: components folder visible (recursive rendering replaced by iterative component works).');
             } else {
                 console.log('components folder not visible.');
             }
        }
    } else {
        console.log('Explorer text NOT found. Taking screenshot of current state.');
        await page.screenshot({ path: '.jules/verification/debug-state.png' });
    }

  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: '.jules/verification/error-final-v2.png' });
  } finally {
    await browser.close();
  }
}

verifyFileExplorer();
