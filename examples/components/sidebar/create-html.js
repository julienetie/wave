const puppeteer = require('./node_modules/puppeteer/index.js');
const fs = require('fs');

async function ssr(url) {
    const start = Date.now();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
        // networkidle0 waits for the network to be idle (no requests for 500ms).
        // The page's JS has likely produced markup by this point, but wait longer
        // if your site lazy loads, etc.
        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.waitForSelector('#sidebar-123'); // ensure #posts exists in the DOM.
    } catch (err) {
        console.error(err);
        throw new Error('page.goto/waitForSelector timed out.');
    }

    // const html = await page.content(); // serialized HTML of page DOM.
    const html = await page.evaluate(() => document.querySelector('#sidebar-123').outerHTML);
    await browser.close();

    const ttRenderMs = Date.now() - start;
    console.info(`Headless rendered page in: ${ttRenderMs}ms`);

    return { html, ttRenderMs };
}

ssr('http://localhost:8080')
    .then(({ html }) => {
        console.log(html)
        fs.writeFile('dist/sidebar.html', html, function(err) {
            if (err) throw err;
            console.log('Saved!');
        });
    })