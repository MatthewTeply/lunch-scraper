import puppeteer from 'puppeteer';

export const createPage = async (pageUrl: string) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(pageUrl);
    await page.setViewport({ width: 1920, height: 1080 });

    return page;
}