import { greaterThanValidator } from './validators';
import numberToText, { type ConvertToTextOptions } from 'number-to-text';

import 'number-to-text/converters/tr.js';

function formatCase(
  value: string,
  caseOption: Exclude<ConvertToTextOptions['case'], undefined>
): string {
  switch (caseOption) {
    case 'upperCase':
      return value.toUpperCase();
    case 'lowerCase':
      return value.toLowerCase();
    case 'titleCase':
      value = value.toLowerCase();
      return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
    default:
      return value.toUpperCase();
  }
}

function paymentPriceToText(
  paymentPrice: number,
  options?: ConvertToTextOptions
): string {
  greaterThanValidator(paymentPrice, 0, 'paymentPrice');

  const [main, sub] = paymentPrice.toFixed(2).split('.');

  const {
    spaces = false,
    language = 'tr',
    case: caseOption = 'upperCase',
    separator
  } = options || {};

  const mainText = numberToText.convertToText(+main, {
    case: caseOption,
    language,
    separator
  });

  const texts: string[] = [
    spaces ? mainText : mainText.replace(/\s/g, ''),
    formatCase('TL', caseOption)
  ];

  if (sub !== '00') {
    const subText = numberToText.convertToText(+sub, {
      case: caseOption,
      language,
      separator
    });

    texts.push(
      spaces ? subText : subText.replace(/\s/g, ''),
      formatCase('KRŞ.', caseOption)
    );
  }

  return texts.join(' ').trim();
}

export default paymentPriceToText;
