import { RenderMarkdown } from "@/components/RenderMarkdown";
import { TableOfContents } from "@/components/TableOfContents";
import { OutgoingLinks } from "@/components/OutgoingLinks";
import { Backlinks } from "@/components/Backlinks";
import { getAllSlugs, getMarkdownBySlug } from "@/lib/content";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getAllSlugs();
}

export default async function DetailNotesPage({ params }) {
  const { slug } = await params;
  const finalSlug = `/` + slug.join("/");
  const post = getMarkdownBySlug(finalSlug);

  if (!post) {
    return notFound();
  }

  const cssClasses = post.frontmatter?.cssclasses?.join(" ") || "";

  return (
    <div>
      <TableOfContents headings={post.tableOfContents} />
      <article id="md-content" className={`${cssClasses}`}>
        <h1>{post.title}</h1>
        <RenderMarkdown post={post} />
      </article>
      <OutgoingLinks links={post.outgoingLinks} />
      <Backlinks links={post.backlinks} />
    </div>
  );
}
