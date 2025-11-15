import fs from "fs";
import path from "path";
import fg from "fast-glob";
import matter from "gray-matter";
import { EXCLUDE_FOLDER, PUBLISH_MODE } from "@/constants";
import { slug as slugify } from "github-slugger";

export function getAllMarkdownFiles({
  baseDir = "src/vault",
  exclude = ["Templates"],
} = {}) {
  const basePath = path.resolve(baseDir);

  const ignorePatterns = (
    EXCLUDE_FOLDER?.length ? EXCLUDE_FOLDER : exclude
  ).map((dir) => path.join(basePath, dir, "**"));

  const files = fg.sync(`${basePath}/**/*.md`, { ignore: ignorePatterns });

  const items = files
    .map((filepath) => {
      const content = fs.readFileSync(filepath, "utf8");
      const { data } = matter(content);

      if (PUBLISH_MODE && !data.publish) return null;

      const rel = path.relative(basePath, filepath);

      const noExt = rel.replace(/\.md$/, "");

      const normalized = noExt.split(path.sep).join("/");

      if (rel === "index.md") {
        return {
          filepath: rel,
          slug: "/",
          title: data.title || "index",
        };
      }

      const cleanSlug = normalized.endsWith("/index")
        ? normalized.replace(/\/index$/, "")
        : normalized;

      const finalSlug = data.slug
        ? `/${data.slug}`
        : "/" + cleanSlug.split("/").map(slugify).join("/");

      const title = data.title || path.basename(noExt);

      return {
        filepath: rel,
        slug: finalSlug,
        title,
      };
    })
    .filter(Boolean)
    .sort((a, b) =>
      a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
    );

  return items;
}
