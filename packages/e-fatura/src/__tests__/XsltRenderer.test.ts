import { it, expect, describe } from 'vitest';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import XsltRenderer from '../XsltRenderer';

const fixturesPath = path.join(__dirname, '__fixtures__');
const xsltFilePath = path.join(fixturesPath, 'gib-e-archive.xslt');
const xmlFilePath = path.join(fixturesPath, 'gib-e-archive-invoice.xml');
const htmlFilePath = path.join(fixturesPath, 'gib-e-archive-invoice.html');

const getXmlBuffer = (): Promise<Buffer> => fs.readFile(xmlFilePath);

describe('XsltRenderer', () => {
  it.todo('toPdf()');

  it('toHtml()', async () => {
    const xsltRenderer = new XsltRenderer(xsltFilePath, getXmlBuffer);
    const renderedHtml = (await xsltRenderer.toHtml()).toString('utf-8');
    const invoiceHtml = await fs.readFile(htmlFilePath, 'utf-8');

    expect(renderedHtml).toStrictEqual(invoiceHtml);
  });

  it('toXml()', async () => {
    const xsltRenderer = new XsltRenderer(xsltFilePath, getXmlBuffer);
    const renderedXml = (await xsltRenderer.toXml()).toString('utf-8');
    const base64Encoded = await xsltRenderer.xsltToBase64Encoded();

    expect(renderedXml).toContain(
      `<cbc:EmbeddedDocumentBinaryObject mimeCode="application/xml" encodingCode="Base64" characterSetCode="UTF-8" filename="${path.basename(
        xsltFilePath
      )}">${base64Encoded}</cbc:EmbeddedDocumentBinaryObject>`.trim()
    );
  });

  it('getXsltContent()', async () => {
    const xsltRenderer = new XsltRenderer(xsltFilePath, getXmlBuffer);

    await expect(xsltRenderer.getXsltContent()).resolves.toStrictEqual(
      await fs.readFile(xsltFilePath)
    );
  });

  it('xsltToBase64Encoded()', async () => {
    const xsltRenderer = new XsltRenderer(xsltFilePath, getXmlBuffer);

    await expect(xsltRenderer.xsltToBase64Encoded()).resolves.toStrictEqual(
      await fs.readFile(xsltFilePath, 'base64url')
    );
  });
});
