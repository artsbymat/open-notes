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
    return (
      <div>
        <article id="md-content">
          <h1>{post.title}</h1>
          <ul className="folder-listing">
            {post.folders?.map((folder) => (
              <li key={folder.slug}>
                <a href={folder.slug}>📁 {folder.title}</a>
              </li>
            ))}
            {post.files?.map((file) => (
              <li key={file.slug}>
                <a href={file.slug}>📄 {file.title}</a>
              </li>
            ))}
          </ul>
        </article>
      </div>
    );
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
