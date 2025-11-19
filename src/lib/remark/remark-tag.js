import { visit } from "unist-util-visit";

// Convert #tag or #/path/like/this inside paragraph text into links
export default function remarkTagLink() {
  return (tree) => {
    visit(tree, "paragraph", (paragraph) => {
      const newChildren = [];

      for (const node of paragraph.children) {
        if (node.type !== "text") {
          newChildren.push(node);
          continue;
        }

        const value = node.value;

        const regex = /(#)([A-Za-z0-9/_-]+)/g;

        let lastIndex = 0;
        let match;

        while ((match = regex.exec(value)) !== null) {
          const start = match.index;
          const fullMatch = match[0];
          const tag = match[2];

          const end = start + fullMatch.length;

          const prevChar = start > 0 ? value[start - 1] : "";
          const nextChar = end < value.length ? value[end] : "";

          const isPrevToken = /[A-Za-z0-9/_-]/.test(prevChar);
          const isNextToken = /[A-Za-z0-9/_-]/.test(nextChar);
          if (isPrevToken || isNextToken) {
            continue;
          }

          if (start > lastIndex) {
            newChildren.push({
              type: "text",
              value: value.slice(lastIndex, start)
            });
          }

          const encoded = encodeURIComponent(tag);

          newChildren.push({
            type: "link",
            url: `/tags/${encoded}`,
            children: [{ type: "text", value: `#${tag}` }]
          });

          lastIndex = end;
        }

        if (lastIndex === 0) {
          newChildren.push(node);
        } else {
          if (lastIndex < value.length) {
            newChildren.push({
              type: "text",
              value: value.slice(lastIndex)
            });
          }
        }
      }

      paragraph.children = newChildren;
    });
  };
}
