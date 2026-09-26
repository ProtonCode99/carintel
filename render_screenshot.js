const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars']
  });
  const page = await browser.newPage();
  
  // Set explicit store dimension
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  
  const filePath = 'file://' + path.resolve(__dirname, 'index.html');
  console.log('Loading:', filePath);
  
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  
  // Hide non-relevant sections and remove scrollbars
  await page.evaluate(() => {
    // Hide header, hero, features, faq, footer
    document.querySelectorAll('nav, .hero, .features, .faq, footer').forEach(el => el.style.display = 'none');
    
    // Adjust showcase spacing
    const preview = document.getElementById('preview');
    if (preview) {
      preview.style.padding = '40px 20px';
      preview.style.margin = '0 auto';
    }
    
    // Hide the h2 and p above the table (Live Preview text)
    const previewHeader = preview.querySelector('div[style*="text-align: center"]');
    if (previewHeader) {
        previewHeader.style.display = 'none';
    }

    // Force body to use dark background directly
    document.body.style.background = '#0f172a';
    document.body.style.overflow = 'hidden'; // Hide scrollbars
  });
  
  // Take screenshot
  const outPath1 = path.resolve(__dirname, 'store-assets', 'screenshot-clean-1280x800.png');
  const outPath2 = path.resolve(process.env.HOME || '/home/ki', 'Downloads', 'screenshot-clean-1280x800.png');
  
  // Ensure dirs exist
  fs.mkdirSync(path.dirname(outPath1), { recursive: true });
  fs.mkdirSync(path.dirname(outPath2), { recursive: true });

  await page.screenshot({ path: outPath1 });
  console.log('Screenshot saved to', outPath1);
  
  await page.screenshot({ path: outPath2 });
  console.log('Screenshot saved to', outPath2);
  
  await browser.close();
})();
