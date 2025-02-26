import { createOption, type Command } from 'commander';
import parsePdfOptions from './parsePdfOptions';
import type * as puppeteer from 'puppeteer-core';

export interface CommandWithPdfOptions {
  readonly pdfOptions?: puppeteer.PDFOptions;
  readonly browserExecutablePath?: string;
}

function commandWidthPdfOptions(command: Command): Command {
  const pdfOptions = createOption(
    '--pdf-options [options...]',
    'PDF oluşturma seçenekleri'
  );

  return command
    .addOption(pdfOptions)
    .option(
      '--browser-executable-path [path]',
      'PDF oluşturmak için kullanılacak tarayıcının çalıştırılabilir dosya yolu'
    )
    .hook('preAction', (thisCommand) => {
      const pdfOptionsValue = thisCommand.getOptionValue(
        pdfOptions.attributeName()
      ) as string[] | undefined;

      if (pdfOptionsValue != null) {
        thisCommand.setOptionValue(
          pdfOptions.attributeName(),
          parsePdfOptions(pdfOptionsValue)
        );
      }
    });
}

export default commandWidthPdfOptions;
