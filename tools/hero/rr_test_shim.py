"""Import this first in a Playwright test (after `from playwright.sync_api import ...`).
1) every new page/context gets an init script: sessionStorage.rrDoorsSeen='1', so the Durbar doors do not cover the page.
2) optional: env RR_CHROMIUM=/path/to/chromium (+ RR_CHROMIUM_ARGS=<json list>) to launch a custom browser. Unused on your machine."""
import os, json
from playwright.sync_api import BrowserType, Browser, BrowserContext
INIT = "try{sessionStorage.setItem('rrDoorsSeen','1')}catch(e){}"
_launch, _np, _nc = BrowserType.launch, Browser.new_page, Browser.new_context
def launch(self, *a, **k):
    if os.environ.get('RR_CHROMIUM'):
        k.setdefault('executable_path', os.environ['RR_CHROMIUM'])
        if os.environ.get('RR_CHROMIUM_ARGS'): k.setdefault('args', json.loads(os.environ['RR_CHROMIUM_ARGS']))
    return _launch(self, *a, **k)
def new_context(self, *a, **k):
    c = _nc(self, *a, **k); c.add_init_script(INIT); return c
def new_page(self, *a, **k):
    c = new_context(self, *a, **k); return c.new_page()
BrowserType.launch, Browser.new_context, Browser.new_page = launch, new_context, new_page
