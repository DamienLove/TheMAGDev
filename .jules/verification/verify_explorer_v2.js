import { chromium } from 'playwright';

async function verifyFileExplorer() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport large enough
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000', { timeout: 60000 });

    // Handle auth modal
    console.log('Checking for auth modal...');
    try {
      // Look for the close button in the modal (top right 'x')
      // It usually has an aria-label or just a class.
      // Based on memory: "The `Auth` component's close button includes a `title` attribute in addition to `aria-label`"
      // Let's look for a button with label 'Close' or similar.
      const closeButton = page.locator('button[aria-label="Close"], button[title="Close"]');
      if (await closeButton.isVisible({ timeout: 5000 })) {
        console.log('Found close button, clicking...');
        await closeButton.click();
      } else {
        console.log('No close button found, maybe "Continue as guest"?');
        const guestButton = page.getByText('Continue as guest');
        if (await guestButton.isVisible({ timeout: 2000 })) {
            await guestButton.click();
        }
      }
    } catch (e) {
      console.log('Error handling auth modal or already dismissed:', e.message);
    }

    // Now we should be on Dashboard. We need to go to Desktop view.
    // The sidebar usually has icons. Let's look for a tooltip or aria-label for "Desktop" or "Workspace".
    // Or we can try to find the text "Desktop" if the sidebar is expanded (it seems to be icon-only based on memory).
    // Memory says: "The 'Stack' view (internally `View.Infrastructure`) is accessible in the main Sidebar via the 'layers' icon."
    // Let's assume there is a 'code' or 'terminal' icon for Desktop.

    console.log('Attempting to navigate to Desktop view...');

    // Try to find a navigation button.
    // In many apps, the first or second icon is the main workspace.
    // Let's try to find an element that might trigger the view change.
    // Inspecting `App.tsx` logic might help, but let's try generic selectors first.

    // Let's take a screenshot of the dashboard to see what we have if we fail.
    await page.screenshot({ path: '.jules/verification/dashboard_view.png' });

    // Try to find "Projects" or "Desktop" in the UI.
    // If we are on Dashboard, maybe there is a "Open Workspace" button?

    // Let's try to find the Sidebar.
    // Assuming the sidebar is on the left.
    // Let's try clicking the second or third button in the sidebar if we can find it.
    // Better: Search for "Desktop" or "Code" text which might be in a tooltip or hidden label.

    // Wait, `App.tsx` renders `AppLayout`.
    // Let's try to locate the "Desktop" view directly if it's already there (it's not, default is Dashboard).

    // Let's try to click on a project in the "Projects" view if we can get there.
    // Memory: "The `Projects` view ... includes an icon-only search input".

    // Let's try to find the "Projects" link/button.
    const projectsBtn = page.locator('button[title="Projects"], button[aria-label="Projects"]');
    if (await projectsBtn.isVisible()) {
        await projectsBtn.click();
        console.log('Clicked Projects button');

        // Wait for projects to load
        await page.waitForTimeout(2000);

        // Click on a template or project to open Desktop
        // Memory: "The `Projects` view ... uses `WorkspaceContext` to load project templates"
        // Let's look for "React Template" or similar
        const template = page.getByText('React Template', { exact: false }).first();
        if (await template.isVisible()) {
            await template.click();
            console.log('Clicked a template');
        }
    } else {
        // Fallback: Try to click "Desktop" button directly
        const desktopBtn = page.locator('button[title="Desktop"], button[aria-label="Desktop"]');
        if (await desktopBtn.isVisible()) {
            await desktopBtn.click();
            console.log('Clicked Desktop button');
        } else {
             // Maybe it's an icon. 'developer_mode' or 'code'?
             // Let's try finding by icon content if possible, or just blind click sidebar items.
             // Actually, the `DesktopWorkspace` header has "DevStudio Master".
             // If we are already there, we might see it.
        }
    }

    console.log('Waiting for "Explorer" text...');
    // Wait for the "Explorer" text which indicates the sidebar is loaded in Desktop view
    // The FileExplorer component we modified renders "Explorer" in uppercase tracking-widest: "EXPLORER" (visual) or "Explorer" (text).
    // Our code: <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Explorer</span>
    // So text is "Explorer".
    await page.waitForSelector('text=Explorer', { timeout: 10000 });

    console.log('Checking for file items...');
    // Check if 'src' folder is visible
    const srcFolder = page.getByText('src', { exact: true });
    await srcFolder.waitFor({ state: 'visible', timeout: 10000 });

    console.log('Expanding src folder...');
    // It might be already expanded or not.
    // Our defaultFiles has src expanded? No, defaultFiles is just data.
    // `FileExplorer` uses `useState(new Set(['/src', ...]))` so it defaults to expanded!
    // So 'components' should be visible.

    const componentsFolder = page.getByText('components', { exact: true });
    // If src is expanded by default, components should be visible.
    if (await componentsFolder.isVisible()) {
        console.log('components folder is visible (default expansion works)');
    } else {
        console.log('components folder not visible, clicking src...');
        await srcFolder.click();
        await componentsFolder.waitFor({ state: 'visible', timeout: 5000 });
    }

    console.log('Taking screenshot of File Explorer...');
    await page.screenshot({ path: '.jules/verification/file-explorer-success.png' });

    console.log('Verification successful!');
  } catch (error) {
    console.error('Verification failed:', error);
    await page.screenshot({ path: '.jules/verification/error_final.png' });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyFileExplorer();
