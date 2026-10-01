export type MarkdownBlock =
  | { kind: "heading"; level: 1 | 2 | 3; content: string }
  | { kind: "label"; content: string }
  | { kind: "paragraph"; content: string }
  | { kind: "unordered-list"; items: string[] }
  | { kind: "ordered-list"; items: string[] }
  | { kind: "code"; language?: string; content: string }
  | { kind: "math"; content: string };

const blockStart = (line: string) => /^(#{1,3})\s+|^```|^\s*[-*+]\s+|^\s*\d+[.)]\s+|^\s*\$\$/.test(line) || /^\*\*(Question|Your turn)\*\*\s*$/i.test(line);

export function markdownToBlocks(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r/g, "").split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", content: paragraph.join(" ").trim() });
    paragraph = [];
  };
  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim()) { flushParagraph(); index += 1; continue; }
    const fence = line.match(/^\s*```\s*([\w+-]*)\s*$/);
    if (fence) {
      flushParagraph(); const code: string[] = []; index += 1;
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) { code.push(lines[index]); index += 1; }
      if (index < lines.length) index += 1;
      blocks.push({ kind: "code", language: fence[1] || undefined, content: code.join("\n") }); continue;
    }
    if (/^\s*\$\$\s*$/.test(line)) {
      flushParagraph(); const math: string[] = []; index += 1;
      while (index < lines.length && !/^\s*\$\$\s*$/.test(lines[index])) { math.push(lines[index]); index += 1; }
      if (index < lines.length) index += 1;
      blocks.push({ kind: "math", content: math.join("\n") }); continue;
    }
    const heading = line.match(/^\s*(#{1,3})\s+(.+?)\s*#*\s*$/);
    if (heading) { flushParagraph(); blocks.push({ kind: "heading", level: heading[1].length as 1 | 2 | 3, content: heading[2] }); index += 1; continue; }
    const label = line.match(/^\s*\*\*(Question|Your turn)\*\*\s*$/i);
    if (label) { flushParagraph(); blocks.push({ kind: "label", content: label[1] }); index += 1; continue; }
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    if (unordered) {
      flushParagraph(); const items: string[] = [];
      while (index < lines.length) { const item = lines[index].match(/^\s*[-*+]\s+(.+)$/); if (!item) break; items.push(item[1].trim()); index += 1; }
      blocks.push({ kind: "unordered-list", items }); continue;
    }
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (ordered) {
      flushParagraph(); const items: string[] = [];
      while (index < lines.length) { const item = lines[index].match(/^\s*\d+[.)]\s+(.+)$/); if (!item) break; items.push(item[1].trim()); index += 1; }
      blocks.push({ kind: "ordered-list", items }); continue;
    }
    if (paragraph.length && blockStart(line)) flushParagraph();
    paragraph.push(line.trim()); index += 1;
  }
  flushParagraph();
  return blocks.filter((block) => block.kind !== "paragraph" || block.content.length > 0);
}
