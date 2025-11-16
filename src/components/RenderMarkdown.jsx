import { MarkdownAsync } from "react-markdown";

import remarkGfm from "remark-gfm";
import rehypeExpressiveCode from "rehype-expressive-code";

import { rehypeSlug } from "@/lib/rehype/rehype-slug";
import { remarkWikilink } from "@/lib/remark/remark-wikilink";

import { CustomParagraph } from "./custom-paragraph";
import { CustomImage } from "./custom-image";
import { rehypeExpressiveCodeOptions } from "@/lib/rehype/expressive-code-option";

export function RenderMarkdown({ post }) {
  const remarkPlugins = [remarkGfm, remarkWikilink];
  const rehypePlugins = [rehypeSlug];

  return (
    <MarkdownAsync
      components={{
        p: CustomParagraph,
        img: CustomImage
      }}
      remarkPlugins={[remarkPlugins]}
      rehypePlugins={[rehypePlugins, [rehypeExpressiveCode, rehypeExpressiveCodeOptions]]}
    >
      {post.content}
    </MarkdownAsync>
  );
}
