import { visit } from "unist-util-visit";

/**
 * @fileoverview
 * A Remark plugin that converts `==text==` into `<mark>text</mark>`.
 *
 * This transformation only applies inside paragraph (`paragraph`) nodes,
 * ensuring that code blocks, headings, blockquotes, and other node types
 * remain unaffected.
 *
 * Example:
 * ```markdown
 * This is ==highlighted== text.
 *
 * # ==not highlighted==
 *
 * \`\`\`
 * ==not highlighted==
 * \`\`\`
 * ```
 *
 * Output:
 * ```html
 * <p>This is <mark>highlighted</mark> text.</p>
 * <h1>==not highlighted==</h1>
 * <pre><code>==not highlighted==</code></pre>
 * ```
 *
 * @module remarkMark
 */

/**
 * A Remark plugin to transform `==text==` → `<mark>text</mark>`
 * inside paragraph nodes only.
 *
 * @returns {import('unified').Transformer} A transformer function compatible with Remark.
 *
 * @example
 * import { remark } from "remark";
 * import remarkMark from "./remark-mark.js";
 * import remarkRehype from "remark-rehype";
 * import rehypeStringify from "rehype-stringify";
 *
 * const markdown = "This is ==highlighted== text.";
 *
 * const html = await remark()
 *   .use(remarkMark)
 *   .use(remarkRehype, { allowDangerousHtml: true })
 *   .use(rehypeStringify, { allowDangerousHtml: true })
 *   .process(markdown);
 *
 * Outputs:
 * // <p>This is <mark>highlighted</mark> text.</p>
 */
export default function remarkObsidianHighlight() {
  return (tree) => {
    // Visit all paragraph nodes in the Markdown AST
    visit(tree, "paragraph", (paragraphNode) => {
      const newChildren = [];

      for (const node of paragraphNode.children) {
        // Only process plain text nodes inside paragraphs
        if (node.type === "text") {
          const parts = [];
          const regex = /(==)([^=]+?)\1/g;
          let lastIndex = 0;
          let match;

          while ((match = regex.exec(node.value)) !== null) {
            const [fullMatch, , textInside] = match;

            // Push text before the ==...==
            if (match.index > lastIndex) {
              parts.push({
                type: "text",
                value: node.value.slice(lastIndex, match.index)
              });
            }

            // Replace ==...== with a <mark> HTML node
            parts.push({
              type: "html",
              value: `<mark>${textInside}</mark>`
            });

            lastIndex = match.index + fullMatch.length;
          }

          // Push remaining text after last match
          if (lastIndex < node.value.length) {
            parts.push({
              type: "text",
              value: node.value.slice(lastIndex)
            });
          }

          // If no match, keep original node
          if (parts.length === 0) parts.push(node);
          newChildren.push(...parts);
        } else {
          // Keep other inline nodes (like links, emphasis) intact
          newChildren.push(node);
        }
      }

      // Replace paragraph children with transformed nodes
      paragraphNode.children = newChildren;
    });
  };
}
