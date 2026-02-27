import { chromium } from 'playwright';

async function verifyFileExplorer() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to app...');
    // Extended timeout for initial load
    await page.goto('http://localhost:3000', { timeout: 60000 });

    // Handle auth if needed (based on memory)
    try {
      const continueAsGuest = page.getByText('Continue as guest');
      if (await continueAsGuest.isVisible({ timeout: 5000 })) {
        await continueAsGuest.click();
      }
    } catch (e) {
      console.log('No auth modal found or already dismissed');
    }

    console.log('Waiting for workspace to load...');
    // Wait for the "Explorer" text which indicates the sidebar is loaded
    await page.waitForSelector('text=Explorer', { timeout: 60000 });

    // Verify FileExplorer structure
    // We expect the new FileExplorer to be present, which renders file items
    // The previous implementation used a recursive function, the new one uses FileExplorer component
    // Visually they should look similar, but we want to ensure it renders content

    console.log('Checking for file items...');
    // Check if 'src' folder is visible (it's in the default files)
    const srcFolder = page.getByText('src', { exact: true });
    await srcFolder.waitFor({ state: 'visible', timeout: 10000 });

    console.log('Expanding src folder...');
    await srcFolder.click();

    // Check if 'components' folder is visible
    const componentsFolder = page.getByText('components', { exact: true });
    await componentsFolder.waitFor({ state: 'visible', timeout: 5000 });

    console.log('Taking screenshot...');
    await page.screenshot({ path: '.jules/verification/file-explorer.png' });

    console.log('Verification successful!');
  } catch (error) {
    console.error('Verification failed:', error);
    // Take error screenshot
    await page.screenshot({ path: '.jules/verification/error.png' });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyFileExplorer();
