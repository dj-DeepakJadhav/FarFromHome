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
    
    # Wait for game initialization
    time.sleep(2.0)
    page.evaluate('''() => {
        const btn = document.getElementById("btn-new-game") || document.getElementById("btn-continue");
        if (btn) btn.click();
    }''')
    # Wait for the 3s initial camera flight into city view
    time.sleep(3.5)

    phase_info = page.evaluate('''() => {
        const g = window.game;
        if (!g) return { error: 'window.game not found' };
        const cep = (g.currentPhase && g.currentPhase.name === 'CITY_EXPLORATION') ? g.currentPhase : (g.phases ? g.phases['CITY_EXPLORATION'] : null);
        return {
            currentPhaseName: g.currentPhaseName,
            hasCityPhase: !!cep,
            doorwayBeacon: !!(cep && cep.doorwayBeacon && cep.doorwayBeacon.visible),
            activeDoorPos: cep && cep.activeDoorPos ? { x: cep.activeDoorPos.x, z: cep.activeDoorPos.z } : null,
            playerPos: cep && cep.playerPos ? { x: cep.playerPos.x, z: cep.playerPos.z } : null,
            inputDisabled: cep ? cep.inputDisabled : null
        };
    }''')
    print('Messenger Phase Inspection:', phase_info)

    # Test keyboard movement
    page.keyboard.down('KeyS')
    time.sleep(1.0)
    page.keyboard.up('KeyS')
    time.sleep(0.3)

    post_pos = page.evaluate('''() => {
        const g = window.game;
        const cep = (g.currentPhase && g.currentPhase.name === 'CITY_EXPLORATION') ? g.currentPhase : g.phases['CITY_EXPLORATION'];
        return cep ? { x: cep.playerPos.x, z: cep.playerPos.z } : null;
    }''')
    print('Post Movement Courier Pos:', post_pos)

    page.screenshot(path='tests/screenshot_start.png', full_page=True)
    browser.close()

if __name__ == '__main__':
    with sync_playwright() as playwright:
        run(playwright)

