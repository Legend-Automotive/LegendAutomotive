from playwright.sync_api import sync_playwright
import time

def test_light_mode_all():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # admin.html
        page.goto("http://localhost:8000/admin.html")
        page.wait_for_timeout(1000)

        # Log console messages
        page.on("console", lambda msg: print(msg.text))

        # Toggle theme on admin
        try:
            page.evaluate("toggleTheme()")
            page.wait_for_timeout(500)
            page.screenshot(path="verification/screenshots/admin_light.png")
            print("Successfully took admin_light.png")
        except Exception as e:
            print(f"Failed to execute toggleTheme on admin.html: {e}")
            page.screenshot(path="verification/screenshots/admin_error.png")

        browser.close()

if __name__ == "__main__":
    test_light_mode_all()
