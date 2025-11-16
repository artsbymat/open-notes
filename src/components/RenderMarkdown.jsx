import { MarkdownAsync } from "react-markdown";

import remarkGfm from "remark-gfm";
import rehypeExpressiveCode from "rehype-expressive-code";
import rehypeShiftHeading from "rehype-shift-heading";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeCallouts from "rehype-callouts";

import { rehypeSlug } from "@/lib/rehype/rehype-slug";
import { remarkWikilink } from "@/lib/remark/remark-wikilink";
import { rehypeExpressiveCodeOptions } from "@/lib/rehype/expressive-code-option";

import { CustomParagraph } from "./custom-paragraph";
import { CustomImage } from "./custom-image";
import { CustomAnchor } from "./custom-anchor";
import { arabicIcon, latinIcon, translateIcon } from "./ui/icons";
import "rehype-callouts/theme/obsidian";

export function RenderMarkdown({ post }) {
  const remarkPlugins = [remarkGfm, remarkWikilink];
  const rehypePlugins = [
    rehypeSlug,
    [rehypeExpressiveCode, rehypeExpressiveCodeOptions],
    [rehypeAutolinkHeadings, { behavior: "append" }],
    [rehypeShiftHeading, { shift: 1 }],
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
    ]
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
