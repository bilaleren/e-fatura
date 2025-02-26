import { xsltRendererCommand } from '../src/commands';
import { Markdown, commandDocsToMarkdown, PROGRAM_NAME } from './helpers';

const USERNAME = 'bilaleren';

commandDocsToMarkdown((command) => {
  const lines: string[] = [
    'docker run',
    '-it --rm --env-file .env',
    '-v "$(pwd)/e-fatura-volume:/root/e-fatura"'
  ];

  if (command === xsltRendererCommand) {
    lines.push('-v "$(pwd)/gib-e-archive.xslt:/usr/app/gib-e-archive.xslt:ro"');
  }

  lines.push(
    `${USERNAME}/${PROGRAM_NAME} ${command.name()} ${command.usage()}`
  );

  return Markdown.codeBlock(
    lines
      .map((line, index) => (index > 0 ? ' '.repeat(4) + line : line))
      .join(' \\\n')
  );
});
