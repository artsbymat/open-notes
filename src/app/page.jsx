import { FileEntry } from "@/components/FileEntry";
import { RenderMarkdown } from "@/components/RenderMarkdown";
import { getMarkdownBySlug } from "@/lib/content";
import { notFound } from "next/navigation";

export default function HomePage() {
  const post = getMarkdownBySlug("/");

  if (!post) {
    return notFound();
  }

  // Handle folder listing
  if (post.isFolder) {
    return <FileEntry post={post} />;
  }

  return (
    <div>
      <article id="md-content">
        <h1>{post.title}</h1>
        <RenderMarkdown post={post} />
      </article>
    </div>
  );
}
