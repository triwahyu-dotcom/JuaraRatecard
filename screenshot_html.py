import asyncio
from playwright.async_api import async_playwright

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1200, "height": 1600})
        await page.goto("file:///Users/yudiqitrick/Desktop/juara-ratecard/quotation-OCBC-Disney-Orchestra.html")
        await page.wait_for_load_state("networkidle")
        
        # Full page screenshot
        await page.screenshot(path="/Users/yudiqitrick/.gemini/antigravity/brain/e753e002-c830-4097-9b6e-2c13f833d85c/scratch/quotation_full.png", full_page=True)
        
        # Individual page screenshots
        pages = await page.query_selector_all(".page")
        for i, pg in enumerate(pages):
            await pg.screenshot(path=f"/Users/yudiqitrick/.gemini/antigravity/brain/e753e002-c830-4097-9b6e-2c13f833d85c/scratch/quot_page_{i+1}.png")
            print(f"Captured page {i+1}")
        
        await browser.close()
        print("Done!")

asyncio.run(capture())
