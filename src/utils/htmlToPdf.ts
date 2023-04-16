import type { PDFOptions as BasePDFOptions } from 'puppeteer'

export interface PDFOptions extends Omit<BasePDFOptions, 'path'> {
  args?: string[]
}

const defaultArgs: string[] = ['--no-sandbox', '--disable-setuid-sandbox']

async function htmlToPdf(html: string, options?: PDFOptions): Promise<Buffer> {
  const { args = defaultArgs, ...pdfOptions } = options || {}
  const puppeteer = await import('puppeteer')
  const browser = await puppeteer.launch({
    args
  })
  const page = await browser.newPage()

  await page.setContent(html, { waitUntil: 'domcontentloaded' })

  return page
    .pdf({
      ...pdfOptions,
      path: undefined
    })
    .finally(() => {
      browser.close()
    })
}

export default htmlToPdf
