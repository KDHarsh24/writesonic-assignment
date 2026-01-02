import puppeteer from 'puppeteer';

/**
 * Crawls ChatGPT Web UI to get an answer for a query.
 * NOTE: This is experimental and may break if ChatGPT changes their UI classes.
 * It also requires the server to be running in an environment where Puppeteer can launch a browser (e.g. Localhost).
 */
export async function crawlChatGPT(query) {
  let browser;
  try {
    console.log('Launching browser for crawling...');
    browser = await puppeteer.launch({
      headless: false, // Set to false so user can see the crawling happening (and solve captchas if needed)
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    const page = await browser.newPage();
    
    // Go to ChatGPT
    console.log('Navigating to ChatGPT...');
    await page.goto('https://chatgpt.com', { waitUntil: 'networkidle2', timeout: 60000 });

    // --- HANDLE POPUPS/COOKIES ---
    try {
      console.log('Checking for popups/cookies...');
      
      // Wait a moment for popups to appear
      await new Promise(r => setTimeout(r, 2000));

      // 1. Accept Cookies (if present)
      const cookieSelectors = ['#onetrust-accept-btn-handler', 'button[id*="onetrust-accept"]'];
      for (const sel of cookieSelectors) {
        const btn = await page.$(sel);
        if (btn) {
          console.log('Clicking Accept Cookies...');
          await btn.click();
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      // 2. "Stay logged out" or "Continue as Guest"
      // Sometimes it shows a login wall with a small link to continue
      const links = await page.$$('div, a, button');
      for (const link of links) {
        const text = await page.evaluate(el => el.textContent, link);
        if (text && (text.includes('Stay logged out') || text.includes('Continue as guest'))) {
          console.log('Clicking continue without login...');
          await link.click();
          await new Promise(r => setTimeout(r, 1000));
          break;
        }
      }

    } catch (e) {
      console.log('Popup handling warning:', e.message);
    }
    // -----------------------------

    // Wait for the prompt textarea
    const promptSelector = '#prompt-textarea';
    console.log('Waiting for input box...');
    await page.waitForSelector(promptSelector, { timeout: 30000 });

    // Type the query
    console.log('Typing query...');
    await page.type(promptSelector, query, { delay: 50 }); // Type with slight delay to simulate human

    // Press Enter to send (more reliable than clicking button)
    console.log('Pressing Enter to send...');
    await page.keyboard.press('Enter');

    console.log('Query sent. Waiting for response...');

    // Wait for the response to generate.
    // We wait for the "Stop generating" button to appear (optional) and then for the "Send" button to reappear.
    
    // Wait a bit for generation to start
    await new Promise(r => setTimeout(r, 3000));

    // Wait for generation to finish. 
    // The send button usually reappears when done.
    // We'll try multiple selectors for the send button.
    const sendButtonSelectors = [
      'button[data-testid="send-button"]',
      'button[aria-label="Send prompt"]',
      'form button.mb-1' // Fallback generic
    ];

    console.log('Waiting for generation to complete...');
    
    // Custom wait function that checks for any of the send button selectors
    await page.waitForFunction((selectors) => {
      return selectors.some(s => document.querySelector(s));
    }, { timeout: 120000 }, sendButtonSelectors); // Increased timeout to 120s for long answers

    // Extract the last response
    console.log('Extracting response...');
    const responses = await page.$$eval('.markdown', (elements) => {
      return elements.map(el => el.innerText);
    });

    if (responses.length > 0) {
      const lastResponse = responses[responses.length - 1];
      console.log('Response extracted successfully.');
      return lastResponse;
    } else {
      throw new Error('No response found in the UI.');
    }

  } catch (error) {
    console.error('Crawling failed:', error);
    throw new Error(`Crawling failed: ${error.message}`);
  } finally {
    if (browser) {
      // await browser.close(); // Keep it open for debugging? No, close it to save resources.
      // Maybe keep it open for a few seconds so user can see?
      setTimeout(async () => {
        try { await browser.close(); } catch(e) {}
      }, 5000);
    }
  }
}
