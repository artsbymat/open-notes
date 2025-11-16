import { MarkdownAsync } from "react-markdown";

import remarkGfm from "remark-gfm";

import { rehypeSlug } from "@/lib/rehype/rehype-slug";
import { remarkWikilinks } from "@/lib/remark/remark-wikilinks";

export function RenderMarkdown({ post }) {
  const remarkPlugins = [remarkGfm, remarkWikilinks({ currentSlug: post.slug })];
  const rehypePlugins = [rehypeSlug];

  return (
    <MarkdownAsync remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
      {post.content}
    </MarkdownAsync>
  );
}
