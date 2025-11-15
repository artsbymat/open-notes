import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";

export function RenderMarkdown({ post }) {
  const remarkPlugins = [remarkGfm];

  return (
    <MarkdownAsync remarkPlugins={remarkPlugins}>{post.content}</MarkdownAsync>
  );
}
