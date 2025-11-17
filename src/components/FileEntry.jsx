import { File, Folder } from "lucide-react";
import Link from "next/link";

export function FileEntry({ post }) {
  return (
    <div>
      <h1 className="text-[1.95rem] font-bold">{post.title}</h1>
      <ul className="mt-2 space-y-2">
        {post.folders?.map((folder) => (
          <li key={folder.slug}>
            <Link href={folder.slug} className="flex items-center gap-x-2">
              <Folder className="text-foreground size-4" />
              {folder.title}
            </Link>
          </li>
        ))}
        {post.files?.map((file) => (
          <li key={file.slug}>
            <Link href={file.slug} className="flex items-center gap-x-2">
              <File className="text-foreground size-4" />
              {file.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
