import { MarkdownAsync } from "react-markdown";

import remarkGfm from "remark-gfm";

import { rehypeSlug } from "@/lib/rehype/rehype-slug";

export function RenderMarkdown({ post }) {
  const remarkPlugins = [remarkGfm];
  const rehypePlugins = [rehypeSlug];

  return (
    <MarkdownAsync remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
      {post.content}
    </MarkdownAsync>
  );
}
