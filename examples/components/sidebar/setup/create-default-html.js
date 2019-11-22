import puppeteer from '../node_modules/puppeteer/index.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
const { PORT } = process.env;

const createDefaultHTML = async (url) => {
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

export default createDefaultHTML;