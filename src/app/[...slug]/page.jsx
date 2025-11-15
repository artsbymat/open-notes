import { RenderMarkdown } from "@/components/RenderMarkdown";
import { getMarkdownBySlug } from "@/lib/content";
import { notFound } from "next/navigation";

export default async function DetailNotesPage({ params }) {
  const { slug } = await params;
  const finalSlug = `/` + slug.join("/");
  const post = getMarkdownBySlug(finalSlug);

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
