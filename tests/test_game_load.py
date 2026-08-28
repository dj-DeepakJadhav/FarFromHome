import sys
import os
import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Load index.html from absolute path
    file_path = os.path.abspath('index.html')
    file_url = f'file:///{file_path}'.replace('\\\\', '/')
    print(f'Loading {file_url}')
    page.goto(file_url)
    
    # Wait for network idle and canvas
    try:
        page.wait_for_load_state('networkidle', timeout=10000)
    except Exception as e:
        print('Network idle timeout, proceeding anyway')
        
    page.screenshot(path='tests/screenshot_start.png', full_page=True)
    
    canvas_count = page.locator('canvas').count()
    print(f'Found {canvas_count} canvas elements')
    
    # We might want to check the DOM for signs of the vision:
    content = page.content()
    
    browser.close()

if __name__ == '__main__':
    with sync_playwright() as playwright:
        run(playwright)

