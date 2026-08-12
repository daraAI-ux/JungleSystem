export function kolamBantuanMarkdownToHtml(markdown: string) {
  const body = stripFrontmatter(markdown).trim();
  const lines = body.split(/\r?\n/);
  const html: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }

    html.push(`<p>${parseInline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) {
      return;
    }

    html.push(`<ul>${listItems.join('')}</ul>`);
    listItems = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index] ?? '';
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith('|') && line.endsWith('|')) {
      flushParagraph();
      flushList();
      const tableLines = [line];
      while (
        index + 1 < lines.length &&
        lines[index + 1]?.trim().startsWith('|') &&
        lines[index + 1]?.trim().endsWith('|')
      ) {
        index += 1;
        tableLines.push(lines[index].trim());
      }
      html.push(renderTable(tableLines));
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${parseInline(heading[2])}</h${level}>`);
      continue;
    }

    const list = line.match(/^[-*]\s+(.+)$/);
    if (list) {
      flushParagraph();
      listItems.push(`<li>${parseInline(list[1])}</li>`);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return html.join('\n');
}

function stripFrontmatter(markdown: string) {
  if (!markdown.startsWith('---\n')) {
    return markdown;
  }

  const end = markdown.indexOf('\n---\n', 4);
  return end === -1 ? markdown : markdown.slice(end + 5);
}

function renderTable(lines: string[]) {
  const rows = lines
    .filter(line => !/^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line))
    .map(line =>
      line
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim()),
    );

  if (!rows.length) {
    return '';
  }

  const [head, ...body] = rows;
  const header = `<tr>${head
    .map(cell => `<th>${parseInline(cell)}</th>`)
    .join('')}</tr>`;
  const bodyRows = body
    .map(
      row =>
        `<tr>${row.map(cell => `<td>${parseInline(cell)}</td>`).join('')}</tr>`,
    )
    .join('');

  return `<table>${header}${bodyRows}</table>`;
}

function parseInline(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
