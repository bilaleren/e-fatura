import * as os from 'node:os';
import { commands } from '../src/commands';
import { markdownTable } from 'markdown-table';
import type { Command } from 'commander';

const EOL = os.EOL;
export const PROGRAM_NAME = 'e-fatura';

type MarkdownList = Array<
  string | number | MarkdownList | { list: MarkdownList; numbered?: boolean }
>;

export class Markdown {
  static link(url: string, title: string): string {
    return `[${title}](${url})`;
  }

  static code(code: string): string {
    return `\`${encodeHtmlEntities(code)}\``;
  }

  static bold(value: string): string {
    return `**${encodeHtmlEntities(value)}**`;
  }

  static list(list: MarkdownList, numbered?: boolean, nestedCount = 0) {
    const lines: string[] = [];

    for (let i = 0; i < list.length; i++) {
      const value = list[i];

      if (Array.isArray(value)) {
        lines.push(this.list(value, numbered, nestedCount + 1));
      } else if (typeof value === 'object') {
        lines.push(this.list(value.list, value.numbered, nestedCount + 1));
      } else {
        const space = nestedCount > 1 ? ' '.repeat(nestedCount) : '';

        if (value === EOL) {
          lines.push(value);
        } else if (!numbered) {
          lines.push(`${space}- ${value}`);
        } else {
          lines.push(`${space}${i + 1}. ${value}`);
        }
      }
    }

    return lines.join(EOL);
  }

  static heading(value: string, level: 1 | 2 | 3 | 4 = 1): string {
    return '#'.repeat(level) + ' ' + encodeHtmlEntities(value);
  }

  static codeBlock(code: string, lang = 'shell'): string {
    return `
\`\`\`${lang}
${code}
\`\`\`
  `.trim();
  }
}

export function encodeHtmlEntities(value: string): string {
  const charsMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return value.replace(/[&<>"']/g, (char) => charsMap[char] || char);
}

export function encodeMdTableEntities(value: string): string {
  return value.replace(/([-|:])/g, '\\$1');
}

export function generateCommandDocs(
  command: Command,
  getCommandUsage = (command: Command) =>
    Markdown.codeBlock(`${PROGRAM_NAME} ${command.name()} ${command.usage()}`)
): string {
  const lines: string[] = [];

  lines.push(Markdown.heading(`${PROGRAM_NAME} ${command.name()}`, 2));

  lines.push(encodeHtmlEntities(command.description()));

  lines.push(getCommandUsage(command));

  lines.push(generateCommandOptionsDocs(command));

  return lines.join(EOL + EOL);
}

export function generateCommandOptionsDocs(command: Command): string {
  const normalizeDefaultValue = (value: any): string => {
    if (value == null) {
      return '\\-';
    } else if (typeof value === 'object') {
      return encodeMdTableEntities(JSON.stringify(value));
    } else {
      if (typeof value === 'string') {
        if (value.startsWith(process.cwd())) {
          return value.replace(process.cwd(), '$PWD');
        } else if (value.startsWith(os.homedir())) {
          return value.replace(os.homedir(), '$HOME');
        }
      }

      return encodeMdTableEntities(value + '');
    }
  };

  const lines: string[] = [Markdown.heading('Seçenekler', 4)];
  const headers: readonly string[] = [
    'Ad',
    'Açıklama',
    'Zorunlu',
    'Varsayılan',
    'Seçenekler'
  ];

  const rows: readonly string[][] = command.options.map((option) => [
    option.name() === 'pdf-options'
      ? Markdown.link('docs/PDF_OPTIONS.md', Markdown.bold(option.flags))
      : Markdown.code(option.flags),
    encodeMdTableEntities(option.description),
    option.required ? 'Evet' : 'Hayır',
    normalizeDefaultValue(option.defaultValue),
    option.argChoices
      ? option.argChoices.map(encodeMdTableEntities).join(', ')
      : '\\-'
  ]);

  lines.push(
    markdownTable([headers, ...rows], {
      align: 'l'
    })
  );

  return lines.join(EOL + EOL);
}

export function commandDocsToMarkdown(
  getCommandUsage?: (command: Command) => string
): void {
  process.stdout.write(EOL);
  process.stdout.write(Markdown.heading('Komutlar') + EOL + EOL);
  process.stdout.write(
    Markdown.list(
      commands.map((command) => {
        const title = `${PROGRAM_NAME} ${command.name()}`;
        return Markdown.link(`#${title.replace(/\s/g, '-')}`, title);
      })
    )
  );

  for (const command of commands) {
    process.stdout.write(
      EOL + EOL + generateCommandDocs(command, getCommandUsage)
    );
  }

  process.stdout.write(EOL);
}
