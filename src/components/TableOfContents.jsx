"use client";

import { ScrollArea } from "./ui/scroll-area";

export function TableOfContents({ headings }) {
  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold uppercase">Table of Contents</h3>
      <ScrollArea className="flex h-full max-h-[400px] flex-col border-l pl-2">
        <ul className="space-y-2 text-sm">
          {headings.map((heading, index) => (
            <li key={index} style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}>
              <a
                href={`#${heading.id}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
