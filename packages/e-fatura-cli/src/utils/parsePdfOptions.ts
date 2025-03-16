import type { PDFOptions, PDFMargin, PaperFormat } from 'puppeteer-core';

function parsePdfOptions(options: readonly string[]): PDFOptions {
  const opts: PDFOptions = {};

  const parseSizeValue = (value: string): string | number => {
    const numeric = +value;
    return Number.isFinite(numeric) ? numeric : value;
  };

  for (const option of options) {
    const [key, value] = option.split('=') as (string | undefined)[];

    switch (key) {
      case 'scale': {
        if (value) {
          opts.scale = Math.min(Math.max(0.1, +value), 2);
        }
        break;
      }
      case 'format': {
        if (value !== '') {
          opts.format = value as PaperFormat;
        } else {
          opts.format = 'A4';
        }
        break;
      }
      case 'width': {
        if (value) {
          opts.width = parseSizeValue(value);
        }
        break;
      }
      case 'height': {
        if (value) {
          opts.height = parseSizeValue(value);
        }
        break;
      }
      case 'landscape': {
        opts.landscape = value === undefined || value === 'true';
        break;
      }
      case 'pageRanges': {
        if (value) {
          opts.pageRanges = value;
        }
        break;
      }
      case 'preferCSSPageSize': {
        opts.preferCSSPageSize = value === undefined || value === 'true';
        break;
      }
      case 'margin': {
        if (value) {
          const marginSize = parseSizeValue(value);

          opts.margin = {
            top: marginSize,
            bottom: marginSize,
            left: marginSize,
            right: marginSize
          };
        }
        break;
      }
      case 'marginTop':
      case 'marginBottom':
      case 'marginLeft':
      case 'marginRight': {
        if (value) {
          const property = key
            .replace('margin', '')
            .toLowerCase() as keyof PDFMargin;

          opts.margin = {
            ...opts.margin,
            [property]: parseSizeValue(value)
          };
        }
        break;
      }
      case 'marginVertical': {
        if (value) {
          const marginSize = parseSizeValue(value);

          opts.margin = {
            ...opts.margin,
            top: marginSize,
            bottom: marginSize
          };
        }
        break;
      }
      case 'marginHorizontal': {
        if (value) {
          const marginSize = parseSizeValue(value);

          opts.margin = {
            ...opts.margin,
            left: marginSize,
            right: marginSize
          };
        }
        break;
      }
    }
  }

  return opts;
}

export default parsePdfOptions;
