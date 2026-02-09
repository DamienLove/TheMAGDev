from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 1024})
        page = context.new_page()

        try:
            print("Navigating to http://localhost:3000")
            page.goto("http://localhost:3000")

            # Wait for loading screen to disappear
            print("Waiting for loading screen to disappear...")
            page.wait_for_selector("img[alt='Loading...']", state="hidden", timeout=10000)

            # Verify something else is visible, like the header or sidebar.
            # Sidebar has 'TheMAG.dev' text? No, header has it.
            # AppLayout header: <span className="font-bold text-white tracking-tighter text-lg hidden md:block">TheMAG.dev</span>

            print("Waiting for main content...")
            page.wait_for_selector("text=TheMAG.dev", timeout=5000)

            # Take a screenshot
            screenshot_path = "verification_screenshot.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error_screenshot.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
