from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1400, 'height': 900})

        try:
            print("Navigating to http://localhost:3000/")
            page.goto("http://localhost:3000/")

            # Check for Auth modal
            try:
                print("Checking for Auth modal...")
                close_button = page.get_by_label("Close")
                if close_button.is_visible(timeout=3000):
                    print("Auth modal found. Closing...")
                    close_button.click()
                else:
                    guest_button = page.get_by_text("Continue as guest")
                    if guest_button.is_visible(timeout=1000):
                         print("Guest button found. Clicking...")
                         guest_button.click()
            except Exception as e:
                print(f"Auth modal check info: {e}")

            # Click 'Workspace' navigation item
            print("Clicking 'Workspace' in navigation...")
            workspace_btn = page.get_by_role("button", name="Workspace")
            workspace_btn.click()

            # Wait for 'src' folder
            print("Waiting for 'src' folder...")
            src_folder = page.get_by_text("src", exact=True)
            expect(src_folder).to_be_visible(timeout=10000)

            # Take initial screenshot
            page.screenshot(path="verification/initial_load.png")
            print("Initial screenshot taken.")

            # Click 'src' to toggle (it is expanded by default)
            print("Clicking 'src' folder...")
            src_folder.click()

            # Wait a bit
            page.wait_for_timeout(500)

            # Take screenshot after toggle
            page.screenshot(path="verification/after_toggle.png")
            print("After toggle screenshot taken.")

            # Click again to expand
            src_folder.click()
            page.wait_for_timeout(500)

            # Verify children are visible again (e.g. 'components')
            print("Verifying 'components' is visible...")
            expect(page.get_by_text("components", exact=True)).to_be_visible()

            page.screenshot(path="verification/final_verification.png")
            print("Final verification screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run()
