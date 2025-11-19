import { getAllTags, getPostsByTag } from "@/lib/content";
import Link from "next/link";

export function generateStaticParams() {
  const tags = getAllTags();

  return tags.map((tag) => ({
    tag: encodeURIComponent(tag)
  }));
}

export default async function TagPage({ params }) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);

  if (!posts) {
    return null;
  }

  return (
    <div id="md-content">
      <h1 className="text-[1.95rem] font-bold">Post by: {tag}</h1>
      <ul className="mt-2 space-y-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={post.slug} className="flex items-center gap-x-2">
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
