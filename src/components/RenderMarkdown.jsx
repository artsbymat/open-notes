import { MarkdownAsync } from "react-markdown";

import remarkGfm from "remark-gfm";
import rehypeExpressiveCode from "rehype-expressive-code";

import { rehypeSlug } from "@/lib/rehype/rehype-slug";
import { remarkWikilink } from "@/lib/remark/remark-wikilink";

import { CustomParagraph } from "./custom-paragraph";
import { CustomImage } from "./custom-image";
import { rehypeExpressiveCodeOptions } from "@/lib/rehype/expressive-code-option";
import { CustomAnchor } from "./custom-anchor";

export function RenderMarkdown({ post }) {
  const remarkPlugins = [remarkGfm, remarkWikilink];
  const rehypePlugins = [rehypeSlug, [rehypeExpressiveCode, rehypeExpressiveCodeOptions]];

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
