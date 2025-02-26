import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import {
  xsltproc,
  htmlToPdf,
  tmpFileAsync,
  type PdfOptions,
  type XsltprocOptions
} from './utils';
import { EInvoiceTypeError } from './errors';

class XsltRenderer {
  private xmlBuffer: Buffer | undefined;

  constructor(
    private readonly xsltFilePath: string,
    private readonly getXmlBuffer: () => Promise<Buffer>,
    private readonly xsltprocOptions?: XsltprocOptions
  ) {}

  /**
   * XSLT şablonunun pdf çıktısını verir.
   */
  async toPdf(options?: PdfOptions): Promise<Buffer> {
    const htmlBuffer = await this.toHtml();

    return htmlToPdf(htmlBuffer.toString('utf-8'), options);
  }

  /**
   * XSLT şablonunun html çıktısını verir.
   */
  toHtml(): Promise<Buffer> {
    return this.render();
  }

  /**
   * İlgili faturaya ait xml çıktısını verir.
   */
  async toXml(): Promise<Buffer> {
    if (!this.xmlBuffer) {
      this.xmlBuffer = await this.getXmlBuffer();
    }

    if (!this.xmlBuffer) {
      throw new EInvoiceTypeError('Faturaya ait xml içeriği yüklenemedi.');
    }

    const filename = path.basename(this.xsltFilePath);
    const xsltBase64String = await this.xsltToBase64Encoded();

    return Buffer.from(
      this.xmlBuffer
        .toString('utf-8')
        .replace(
          /<(cbc:EmbeddedDocumentBinaryObject)\s(.*?)\sfilename=".*">.*<\/cbc:EmbeddedDocumentBinaryObject>/g,
          `<$1 $2 filename="${filename}">${xsltBase64String}</$1>`
        )
    );
  }

  /**
   * XSLT şablonunun içeriğini verir.
   */
  getXsltContent(): Promise<Buffer> {
    return fs.readFile(this.xsltFilePath);
  }

  /**
   * XSLT şablonunun base64 ile kodlanmış içeriğini verir.
   */
  xsltToBase64Encoded(): Promise<string> {
    return fs.readFile(this.xsltFilePath, 'base64url');
  }

  private async render(): Promise<Buffer> {
    const xmlTmpFile = await tmpFileAsync();
    const xmlBuffer = await this.toXml();

    await fs.writeFile(xmlTmpFile.name, xmlBuffer, 'utf-8');

    return xsltproc(
      [this.xsltFilePath, xmlTmpFile.name],
      this.xsltprocOptions
    ).finally(() => xmlTmpFile.cleanup());
  }
}

export default XsltRenderer;
