from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()

    try:
        print("Navigating to app...")
        page.goto("http://localhost:5173")
        page.wait_for_timeout(5000)

        # Wait for loading screen to disappear
        print("Waiting for loading screen...")
        try:
            page.locator(".splash-logo").wait_for(state="hidden", timeout=10000)
        except:
            print("Splash logo wait timed out (maybe already gone)")

        # Handle Auth if needed
        try:
            guest_btn = page.get_by_role("button", name="Continue as guest")
            if guest_btn.count() > 0:
                if guest_btn.is_visible():
                    print("Clicking Continue as guest...")
                    guest_btn.click()
                    page.wait_for_timeout(2000)
        except Exception as e:
            print(f"Auth skip error: {e}")

        # Verify Infrastructure (Monitor)
        print("Checking Infrastructure...")
        # Sidebar icon "layers"
        # Wait for sidebar to be interactive
        page.wait_for_timeout(2000)

        layers_btn = page.locator(".material-symbols-rounded").filter(has_text="layers").first
        if layers_btn.is_visible():
            layers_btn.click()
            page.wait_for_timeout(1000)

            refresh_btn = page.get_by_role("button", name="Refresh Status")
            if refresh_btn.is_visible():
                print("Refresh Status button found.")
            else:
                print("Refresh Status button NOT found.")
        else:
            print("Layers button not visible")

        # Verify Showcase (Projects)
        print("Checking Showcase...")
        hub_btn = page.locator(".material-symbols-rounded").filter(has_text="hub").first
        hub_btn.click()
        page.wait_for_timeout(1000)

        clone_btns = page.get_by_role("button", name="Clone to Workspace")
        if clone_btns.count() > 0:
            print(f"Found {clone_btns.count()} Clone buttons.")
        else:
            print("Clone buttons NOT found.")

        # Verify Workspace (Desktop)
        print("Checking Workspace...")
        desktop_btn = page.locator(".material-symbols-rounded").filter(has_text="desktop_windows").first
        desktop_btn.click()
        page.wait_for_timeout(2000)

        # Check Build/Debug buttons. They are in the header.
        # Header is hidden on mobile, but viewport is desktop.
        build_btn = page.get_by_role("button", name="Build")
        if build_btn.is_visible():
            print("Build button found.")
        else:
            print("Build button NOT visible.")

        debug_btn = page.get_by_role("button", name="Debug")
        if debug_btn.is_visible():
            print("Debug button found.")
        else:
            print("Debug button NOT visible.")

        # Open Settings Modal
        print("Opening Settings...")
        # In DesktopWorkspace sidebar (Activity Bar)
        # It's 'settings' icon.
        # Sidebar has one too.
        # DesktopWorkspace sidebar is `aside className="w-12 ..."`
        # Global sidebar is `aside className="w-16 ..."`

        # Let's target the one in w-12 aside.
        workspace_settings = page.locator("aside.w-12 button .material-symbols-rounded").filter(has_text="settings").first
        if workspace_settings.is_visible():
            workspace_settings.click()
            page.wait_for_timeout(1000)

            # Check for modal content
            # Modal has text "Settings"
            settings_header = page.locator("h2").filter(has_text="Settings").first
            # Or just text "General Settings"
            if settings_header.is_visible() or page.locator("text=General Settings").is_visible():
                print("Settings modal opened successfully.")
            else:
                print("Settings modal NOT visible.")
        else:
            print("Workspace settings button not found.")

        page.screenshot(path="verification/screenshot.png")
        print("Screenshot saved.")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        page.screenshot(path="verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
