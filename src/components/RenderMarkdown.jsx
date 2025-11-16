import { MarkdownAsync } from "react-markdown";

import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeExpressiveCode from "rehype-expressive-code";
import rehypeShiftHeading from "rehype-shift-heading";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeCallouts from "rehype-callouts";
import rehypeKatex from "rehype-katex";

import { rehypeSlug } from "@/lib/rehype/rehype-slug";
import { remarkWikilink } from "@/lib/remark/remark-wikilink";
import { rehypeExpressiveCodeOptions } from "@/lib/rehype/expressive-code-option";

import { CustomParagraph } from "./custom-paragraph";
import { CustomImage } from "./custom-image";
import { CustomAnchor } from "./custom-anchor";
import { arabicIcon, latinIcon, translateIcon } from "./ui/icons";
import "rehype-callouts/theme/obsidian";
import "katex/dist/katex.min.css";

export function RenderMarkdown({ post }) {
  const remarkPlugins = [remarkGfm, remarkMath, remarkWikilink];
  const rehypePlugins = [
    rehypeSlug,
    [rehypeAutolinkHeadings, { behavior: "append" }],
    [rehypeShiftHeading, { shift: 1 }],
    [rehypeKatex],
    [
      rehypeCallouts,
      {
        theme: "obsidian",
        callouts: {
          arabic: { title: "Arabic", indicator: arabicIcon },
          latin: { title: "Latin", indicator: latinIcon },
          translation: { title: "Translation", indicator: translateIcon }
        }
      }
    ],
    [rehypeExpressiveCode, rehypeExpressiveCodeOptions]
  ];

  return (
    <MarkdownAsync
      components={{
        p: CustomParagraph,
        img: CustomImage,
        a: CustomAnchor
      }}
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
    >
      {post.content}
    </MarkdownAsync>
  );
}
