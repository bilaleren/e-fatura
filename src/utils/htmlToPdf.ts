import type { PDFOptions as BasePDFOptions } from 'puppeteer'

export interface PdfOptions extends Omit<BasePDFOptions, 'path'> {
  args?: string[]
}

const defaultArgs: string[] = ['--no-sandbox', '--disable-setuid-sandbox']

async function htmlToPdf(html: string, options?: PdfOptions): Promise<Buffer> {
  const { args = defaultArgs, ...pdfOptions } = options || {}
  const puppeteer = await import('puppeteer')
  const browser = await puppeteer.launch({
    args,
    headless: 'new'
  })
  const page = await browser.newPage()

  await page.setContent(html, { waitUntil: 'domcontentloaded' })

  return page
    .pdf({
      format: 'A4',
      ...pdfOptions,
      path: undefined
    })
    .finally(() => browser.close())
}

export default htmlToPdf
