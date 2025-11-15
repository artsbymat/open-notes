import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function buildFileTree(items) {
  const root = [];

  for (const item of items) {
    const parts = item.filepath.split("/");

    let current = root;

    parts.forEach((part, idx) => {
      const isFile = idx === parts.length - 1;

      if (isFile) {
        current.push({
          type: "file",
          name: item.title,
          slug: item.slug,
        });
      } else {
        let folder = current.find(
          (c) => c.type === "folder" && c.name === part,
        );

        if (!folder) {
          folder = {
            type: "folder",
            name: part,
            children: [],
          };
          current.push(folder);
        }

        current = folder.children;
      }
    });
  }

  // Sort folder and file
  function sortTree(nodes) {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    nodes.forEach((n) => {
      if (n.type === "folder") sortTree(n.children);
    });
  }

  sortTree(root);

  return root;
}
