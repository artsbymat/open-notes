import { getAllTags } from "@/lib/content";
import { Tag } from "lucide-react";
import Link from "next/link";

export default function TagsPage() {
  const tags = getAllTags();
  return (
    <div>
      <h1 className="text-[1.95rem] font-bold">List Tag</h1>
      <ul className="mt-2 space-y-2">
        {tags.map((tag) => (
          <li key={tag}>
            <Link href={`/tags/${tag}`} className="flex items-center gap-x-2">
              <Tag className="size-4" />
              <span className="text-link">{decodeURIComponent(tag)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
