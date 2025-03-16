import * as os from 'node:os';
import { commands, xsltRendererCommand } from '../src/commands';
import { markdownTable } from 'markdown-table';
import { repository } from '../package.json';
import type { Command } from 'commander';

const EOL = os.EOL;
const PROGRAM_NAME = 'e-fatura';
const DOCHERHUB_USERNAME = 'bilaleren';
const PDF_OPTIONS_DOCS_LINK = process.env.DOCKER_README
  ? `${repository}/blob/master/packages/e-fatura-cli/docs/PDF_OPTIONS.md`
  : 'docs/PDF_OPTIONS.md';

type MarkdownList = Array<
  string | number | MarkdownList | { list: MarkdownList; numbered?: boolean }
>;

class Markdown {
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

function encodeHtmlEntities(value: string): string {
  const charsMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return value.replace(/[&<>"']/g, (char) => charsMap[char] || char);
}

function encodeMdTableEntities(value: string): string {
  return value.replace(/([-|:])/g, '\\$1');
}

function getCommandTitle(command: Command): string {
  return `${PROGRAM_NAME} ${command.name()}`;
}

function getCommandUsageForDocker(command: Command): string {
  const lines: string[] = [
    'docker run',
    '-it --rm --env-file .env',
    '-v "$(pwd)/e-fatura-volume:/root/e-fatura"'
  ];

  if (command === xsltRendererCommand) {
    lines.push('-v "$(pwd)/gib-e-archive.xslt:/usr/app/gib-e-archive.xslt:ro"');
  }

  lines.push(
    `${DOCHERHUB_USERNAME}/${getCommandTitle(command)} ${command.usage().replace('<xslt-path>', './gib-e-archive.xslt')}`
  );

  return Markdown.codeBlock(
    lines
      .map((line, index) => (index > 0 ? ' '.repeat(4) + line : line))
      .join(' \\\n')
  );
}

function generateCommandDocs(command: Command): string {
  const lines: string[] = [];
  const commandTitle = getCommandTitle(command);

  if (process.env.DOCKER_README) {
    lines.push(`<div id="${commandTitle.replace(/\s/g, '-')}"></div>`);
  }

  lines.push(Markdown.heading(commandTitle, 2));

  lines.push(encodeHtmlEntities(command.description()));

  if (process.env.DOCKER_README) {
    lines.push(getCommandUsageForDocker(command));
  } else {
    lines.push(Markdown.codeBlock(`${commandTitle} ${command.usage()}`));
  }

  lines.push(generateCommandOptionsDocs(command));

  return lines.join(EOL + EOL);
}

function generateCommandOptionsDocs(command: Command): string {
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
      ? Markdown.link(PDF_OPTIONS_DOCS_LINK, option.flags)
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

function commandDocsToMarkdown(): void {
  process.stdout.write(EOL);
  process.stdout.write(Markdown.heading('Komutlar') + EOL + EOL);
  process.stdout.write(
    Markdown.list(
      commands.map((command) => {
        const title = getCommandTitle(command);
        return Markdown.link(`#${title.replace(/\s/g, '-')}`, title);
      })
    )
  );

  for (const command of commands) {
    process.stdout.write(EOL + EOL + generateCommandDocs(command));
  }

  process.stdout.write(EOL);
}

commandDocsToMarkdown();
