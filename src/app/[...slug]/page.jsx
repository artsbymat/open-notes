import { RenderMarkdown } from "@/components/RenderMarkdown";
import { TableOfContents } from "@/components/TableOfContents";
import { OutgoingLinks } from "@/components/OutgoingLinks";
import { Backlinks } from "@/components/Backlinks";
import { getAllSlugs, getMarkdownBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import { FileEntry } from "@/components/FileEntry";
import removeMd from "remove-markdown";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const finalSlug = `/` + slug.join("/");
  const post = getMarkdownBySlug(finalSlug);

  if (!post) {
    return {};
  }

  if (post.isFolder) {
    return {};
  }

  return {
    title: post.title,
    description: post.frontmatter.description || removeMd(post.content).slice(0, 180),
    keywords: post.frontmatter.tags
  };
}

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

  // Handle folder listing
  if (post.isFolder) {
    return <FileEntry post={post} />;
  }

  const cssClasses = post.frontmatter?.cssclasses?.join(" ") || "";
  const noIndex = post.frontmatter?.["no-index"] === true;

  return (
    <div>
      <TableOfContents headings={post.tableOfContents} />
      <article
        id="md-content"
        className={`${cssClasses}`}
        {...(noIndex ? { "data-pagefind-ignore": "" } : { "data-pagefind-body": "" })}
      >
        <h1>{post.title}</h1>
        <RenderMarkdown post={post} />
      </article>
      <OutgoingLinks links={post.outgoingLinks} />
      <Backlinks links={post.backlinks} />
    </div>
  );
}
