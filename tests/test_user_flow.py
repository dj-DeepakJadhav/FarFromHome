import os
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    page = b.new_page()
    page.on('console', lambda msg: print('CONSOLE:', msg.text))
    page.on('pageerror', lambda err: print('ERROR:', err))
    page.goto('file://' + os.path.abspath('index.html'))
    time.sleep(2)
    page.evaluate("document.getElementById('btn-new-game')?.click()")
    time.sleep(6)
    print('PHASE:', page.evaluate("window.game.currentPhaseName"))
    buttons = page.evaluate("document.querySelectorAll('#story-choices-container button').length")
    print('OVERLAY BUTTONS:', buttons)
    page.evaluate("document.querySelector('#story-choices-container button')?.click()")
    time.sleep(2)
    print('POST CLICK TARGET:', page.evaluate("window.game.storyRunner.pendingStoryTarget"))
    print('POST CLICK PHASE:', page.evaluate("window.game.currentPhaseName"))
    print('POST CLICK BEACON:', page.evaluate("!!window.game.phases.CITY_EXPLORATION.doorwayBeacon?.visible"))
    b.close()
