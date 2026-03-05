from playwright.sync_api import sync_playwright

def verify_a11y():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        print("Navigating to app...")
        try:
            page.goto("http://localhost:3000")
        except Exception as e:
            print(f"Failed to navigate: {e}")
            return

        # Wait for sidebar to load
        print("Waiting for sidebar...")
        try:
            page.wait_for_selector("aside", timeout=10000)
        except Exception as e:
            print(f"Sidebar failed to load: {e}")
            page.screenshot(path="verification/debug_fail.png")
            return

        # Check Logo
        try:
            logo = page.get_by_label("DevStudio Logo")
            if logo.count() > 0:
                print("SUCCESS: Logo found by aria-label 'DevStudio Logo'")
            else:
                print("FAILED: Logo NOT found by aria-label 'DevStudio Logo'")
        except Exception as e:
            print(f"Error checking Logo: {e}")

        # Check Navigation Items (Monitor)
        try:
            monitor = page.get_by_label("Monitor")
            if monitor.count() > 0:
                print("SUCCESS: Monitor button found by aria-label 'Monitor'")
            else:
                print("FAILED: Monitor button NOT found by aria-label 'Monitor'")
        except Exception as e:
            print(f"Error checking Monitor: {e}")

        # Check Support
        try:
            support = page.get_by_label("Support")
            if support.count() > 0:
                print("SUCCESS: Support button found by aria-label 'Support'")
            else:
                print("FAILED: Support button NOT found by aria-label 'Support'")
        except Exception as e:
            print(f"Error checking Support: {e}")

        # Check Settings
        try:
            settings = page.get_by_label("Settings")
            if settings.count() > 0:
                print("SUCCESS: Settings button found by aria-label 'Settings'")
            else:
                print("FAILED: Settings button NOT found by aria-label 'Settings'")
        except Exception as e:
            print(f"Error checking Settings: {e}")

        # Check User Profile
        try:
            profile = page.get_by_role("button", name="User profile")
            if profile.count() > 0:
                print("SUCCESS: User profile found by role='button' and label 'User profile'")
            else:
                print("FAILED: User profile NOT found by role='button' and label 'User profile'")
        except Exception as e:
            print(f"Error checking User Profile: {e}")

        # Take screenshot
        page.screenshot(path="verification/sidebar_a11y.png")
        print("Screenshot saved to verification/sidebar_a11y.png")

        browser.close()

if __name__ == "__main__":
    verify_a11y()
