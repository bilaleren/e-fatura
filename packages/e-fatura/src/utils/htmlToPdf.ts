import type { PDFOptions as BasePDFOptions } from 'puppeteer-core';

export type PdfOptions = Omit<BasePDFOptions, 'path'> & {
  args?: string[];
};

async function htmlToPdf(html: string, options?: PdfOptions): Promise<Buffer> {
  const {
    args = ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
    ...pdfOptions
  } = options || {};
  const { launch: launchBrowser } = await import('puppeteer-core');
  const browser = await launchBrowser({
    args,
    timeout: 5_000,
    headless: true,
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      process.env.CHROME_BIN ||
      '/usr/bin/chromium-browser'
  });
  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: 'domcontentloaded'
  });

  try {
    const pdfBytes = await page.pdf({
      format: 'A4',
      ...pdfOptions,
      path: undefined
    });

    return Buffer.from(pdfBytes);
    // eslint-disable-next-line no-useless-catch
  } catch (err) {
    throw err;
  } finally {
    await browser.close();
  }
}

export default htmlToPdf;
