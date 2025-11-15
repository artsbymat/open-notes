import { RenderMarkdown } from "@/components/RenderMarkdown";
import { getMarkdownBySlug } from "@/lib/content";

export default function HomePage() {
  const post = getMarkdownBySlug("/");

  if (!post) {
    return notFound();
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
