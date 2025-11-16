import { MarkdownAsync } from "react-markdown";

import remarkGfm from "remark-gfm";

import { rehypeSlug } from "@/lib/rehype/rehype-slug";
import { remarkWikilink } from "@/lib/remark/remark-wikilink";

export function RenderMarkdown({ post }) {
  const remarkPlugins = [remarkWikilink, remarkGfm];
  const rehypePlugins = [rehypeSlug];

  return (
    <MarkdownAsync remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
      {post.content}
    </MarkdownAsync>
  );
}
