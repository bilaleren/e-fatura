import { launch, type Browser } from 'puppeteer-core';

function launchBrowser(executablePath?: string): Promise<Browser> {
  return launch({
    args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
    timeout: 5_000,
    headless: true,
    executablePath:
      executablePath ||
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      process.env.CHROME_BIN ||
      '/usr/bin/chromium-browser'
  });
}

export default launchBrowser;
