const puppeteer = require('../node_modules/puppeteer/index.js');
const fs = require('fs');
require('dotenv').config();

const { PORT } = process.env;
console.log('PPPORT', PORT)
const ssr = async (url) => {
    const start = Date.now();
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.waitForSelector('#sidebar-123');
    } catch (err) {
        console.error(err);
        throw new Error('page.goto/waitForSelector timed out.');
    }

    const html = await page.evaluate(() => document.querySelector('#sidebar-123').outerHTML);
    await browser.close();
    const ttRenderMs = Date.now() - start;
    console.info(`Headless rendered page in: ${ttRenderMs}ms`);
    return { html, ttRenderMs };
}

ssr(`http://localhost:${PORT}`)
    .then(({ html }) => {
        fs.writeFile('dist/sidebar.html', html, (err) => {
            if (err) throw err;
            console.log('Saved!');
        });
    });