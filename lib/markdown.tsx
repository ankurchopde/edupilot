import type { ReactNode } from "react";
import { markdownToBlocks } from "./markdown-parser";

function safeHref(value: string) {
  return /^(https?:|mailto:)/i.test(value) ? value : undefined;
}

function inlineNodes(value: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\([^\s)]+\)|\$[^$\n]+\$|\*[^*\n]+\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(value))) {
    if (match.index > last) nodes.push(value.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("**")) nodes.push(<strong key={`strong-${match.index}`}>{inlineNodes(token.slice(2, -2))}</strong>);
    else if (token.startsWith("`")) nodes.push(<code key={`code-${match.index}`} className="inline-code">{token.slice(1, -1)}</code>);
    else if (token.startsWith("[")) {
      const link = token.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
      if (link) {
        const href = safeHref(link[2]);
        nodes.push(href ? <a key={`link-${match.index}`} href={href} target="_blank" rel="noreferrer">{link[1]}</a> : link[1]);
      } else nodes.push(token);
    } else if (token.startsWith("$")) nodes.push(<code key={`math-${match.index}`} className="math-inline" aria-label="Mathematical expression">{token.slice(1, -1)}</code>);
    else nodes.push(<em key={`em-${match.index}`}>{inlineNodes(token.slice(1, -1))}</em>);
    last = match.index + token.length;
  }
  if (last < value.length) nodes.push(value.slice(last));
  return nodes;
}

export { markdownToBlocks };

export function TutorMarkdown({ content }: { content: string }) {
  return <div className="tutor-markdown">{markdownToBlocks(content).map((block, index) => {
    if (block.kind === "heading") {
      const Tag = `h${block.level}` as "h1" | "h2" | "h3";
      return <Tag key={index}>{inlineNodes(block.content)}</Tag>;
    }
    if (block.kind === "label") return <strong className="markdown-label" key={index}>{block.content}</strong>;
    if (block.kind === "paragraph") return <p key={index}>{inlineNodes(block.content)}</p>;
    if (block.kind === "unordered-list") return <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{inlineNodes(item)}</li>)}</ul>;
    if (block.kind === "ordered-list") return <ol key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{inlineNodes(item)}</li>)}</ol>;
    if (block.kind === "math") return <pre className="math-block" key={index} aria-label="Mathematical expression">{block.content}</pre>;
    return <pre className="markdown-code" key={index}><code data-language={block.language}>{block.content}</code></pre>;
  })}</div>;
}
