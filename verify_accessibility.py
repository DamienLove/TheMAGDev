import os
import time
from playwright.sync_api import sync_playwright

def verify_settings_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Increase viewport size
        page = browser.new_page(viewport={"width": 1280, "height": 1024})

        print("Navigating to app...")
        page.goto("http://localhost:3000")

        # Wait for potential loading screen to disappear
        time.sleep(5)

        print("Checking for Auth modal...")
        # Check for 'Continue as guest' button
        guest_button = page.locator("text=Continue as guest")
        try:
            if guest_button.is_visible(timeout=5000):
                print("Auth modal found. Clicking 'Continue as guest'...")
                guest_button.scroll_into_view_if_needed()
                guest_button.click()
                time.sleep(1)
            else:
                print("Auth modal not visible.")
        except Exception as e:
            print(f"Error checking/clicking guest button: {e}")

        # Click on Settings in the sidebar
        print("Clicking Settings...")
        try:
            # Maybe sidebar is hidden or needs interaction?
            # Let's wait for the sidebar settings icon/text
            settings_button = page.locator("text=Settings").first
            settings_button.wait_for(state="visible", timeout=10000)
            settings_button.click()
        except Exception as e:
            print(f"Failed to click Settings: {e}")
            page.screenshot(path="verification/failed_click_settings.png")
            print("Taken screenshot of failure")
            browser.close()
            return

        # Wait for settings content
        print("Waiting for settings content...")
        try:
            page.wait_for_selector("text=General Settings", timeout=5000)
        except:
            print("General Settings header not found. Checking if we are on Settings page...")
            page.screenshot(path="verification/failed_settings_load.png")
            # Maybe we need to click it harder?

        # Click on "AI Providers" tab
        print("Clicking AI Providers...")
        try:
            page.click("button:has-text('AI Providers')", timeout=5000)
        except:
            print("AI Providers tab not found or clickable")
            page.screenshot(path="verification/failed_ai_tab.png")
            browser.close()
            return

        # Wait for providers to load
        page.wait_for_selector("text=AI Providers")

        time.sleep(1) # Wait for transitions

        # Take a screenshot of the providers list
        os.makedirs("verification", exist_ok=True)
        page.screenshot(path="verification/providers_list.png")
        print("Screenshot of providers list taken")

        # Find the first expand button and check aria-label
        expand_buttons = page.locator("button[aria-label*='Expand']")
        count = expand_buttons.count()
        print(f"Found {count} expand buttons with aria-label containing 'Expand'")

        if count > 0:
            first_button = expand_buttons.first
            aria_label = first_button.get_attribute("aria-label")
            print(f"Expand button aria-label: {aria_label}")

            # Click to expand
            first_button.click()

            # Wait for form to appear
            page.wait_for_selector("label:text('API Key')")

            # Check for label-input association
            api_key_label = page.locator("label").filter(has_text="API Key").first
            html_for = api_key_label.get_attribute("for")
            print(f"API Key label for: {html_for}")

            if html_for:
                # Find the input with that ID
                input_element = page.locator(f"#{html_for}")
                if input_element.count() > 0:
                    print(f"SUCCESS: Input element found with ID {html_for}")
                else:
                    print(f"FAILURE: Input element NOT found with ID {html_for}")
            else:
                print("FAILURE: Label has no 'for' attribute")

            # Screenshot of expanded form
            page.screenshot(path="verification/expanded_provider.png")
            print("Screenshot of expanded provider taken")
        else:
            print("FAILURE: No expand buttons found with aria-label")
            page.screenshot(path="verification/failed_expand.png")

        browser.close()

if __name__ == "__main__":
    verify_settings_accessibility()
