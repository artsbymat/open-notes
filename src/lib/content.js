import fs from "fs";
import path from "path";
import fg from "fast-glob";
import matter from "gray-matter";
import { EXCLUDE_FOLDER, PUBLISH_MODE } from "@/constants";
import GithubSlugger, { slug as slugify } from "github-slugger";

export let cache = null;
let backlinksCache = null;

export function getAllMarkdownFiles(options = {}) {
  const opts = {
    baseDir: "src/vault",
    exclude: ["Templates"],
    ...options,
  };

  if (cache && cache.length > 0) {
    return cache;
  }

  const { baseDir, exclude } = opts;
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
        : "/" + cleanSlug.split("/").map(slugify).join("/").toLowerCase();

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

  cache = items;

  return items;
}

function extractLinks(content) {
  const links = [];

  // Extract wikilinks [[Page]] or [[Page|Alias]]
  const wikilinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match;
  while ((match = wikilinkRegex.exec(content)) !== null) {
    links.push(match[1].trim());
  }

  // Extract markdown links [text](url)
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  while ((match = mdLinkRegex.exec(content)) !== null) {
    const url = match[2].trim();
    // Only include relative links (not external URLs)
    if (
      !url.startsWith("http://") &&
      !url.startsWith("https://") &&
      !url.startsWith("#")
    ) {
      links.push(url);
    }
  }

  return links;
}

function buildBacklinksMap() {
  if (backlinksCache) {
    return backlinksCache;
  }

  const all = getAllMarkdownFiles();
  const backlinks = {};

  // Initialize backlinks for all slugs
  all.forEach((item) => {
    backlinks[item.slug] = [];
  });

  // Build a map of title/filepath to slug for matching wikilinks
  const titleToSlug = {};
  const filepathToSlug = {};
  all.forEach((item) => {
    titleToSlug[item.title.toLowerCase()] = item.slug;
    const pathWithoutExt = item.filepath.replace(/\.md$/, "");
    filepathToSlug[pathWithoutExt.toLowerCase()] = item.slug;
  });

  // Process each file to find links
  all.forEach((sourceItem) => {
    const fullPath = path.join("src/vault", sourceItem.filepath);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { content } = matter(raw);

    const links = extractLinks(content);

    links.forEach((link) => {
      const linkLower = link.toLowerCase();
      let targetSlug = null;

      // Try to match by title (for wikilinks)
      if (titleToSlug[linkLower]) {
        targetSlug = titleToSlug[linkLower];
      }
      // Try to match by filepath
      else if (filepathToSlug[linkLower]) {
        targetSlug = filepathToSlug[linkLower];
      }
      // Try to match as a relative path with leading slash
      else {
        const cleanLink = link.startsWith("/") ? link : `/${link}`;
        const foundItem = all.find(
          (item) =>
            item.slug === cleanLink ||
            item.slug === cleanLink.replace(/\/$/, ""),
        );
        if (foundItem) {
          targetSlug = foundItem.slug;
        }
      }

      // Add backlink if target found
      if (targetSlug && backlinks[targetSlug]) {
        backlinks[targetSlug].push({
          slug: sourceItem.slug,
          title: sourceItem.title,
          filepath: sourceItem.filepath,
        });
      }
    });
  });

  backlinksCache = backlinks;
  return backlinks;
}

function buildOutgoingLinks(content) {
  const all = getAllMarkdownFiles();
  const links = extractLinks(content);
  const outgoingLinks = [];

  const titleToSlug = {};
  const filepathToSlug = {};
  all.forEach((item) => {
    titleToSlug[item.title.toLowerCase()] = item.slug;
    const pathWithoutExt = item.filepath.replace(/\.md$/, "");
    filepathToSlug[pathWithoutExt.toLowerCase()] = item.slug;
  });

  links.forEach((link) => {
    const linkLower = link.toLowerCase();
    let targetSlug = null;
    let targetTitle = null;
    let targetFilepath = null;

    // Try to match by title (for wikilinks)
    if (titleToSlug[linkLower]) {
      targetSlug = titleToSlug[linkLower];
      const found = all.find((item) => item.slug === targetSlug);
      if (found) {
        targetTitle = found.title;
        targetFilepath = found.filepath;
      }
    }
    // Try to match by filepath
    else if (filepathToSlug[linkLower]) {
      targetSlug = filepathToSlug[linkLower];
      const found = all.find((item) => item.slug === targetSlug);
      if (found) {
        targetTitle = found.title;
        targetFilepath = found.filepath;
      }
    }
    // Try to match as a relative path with leading slash
    else {
      const cleanLink = link.startsWith("/") ? link : `/${link}`;
      const found = all.find(
        (item) =>
          item.slug === cleanLink || item.slug === cleanLink.replace(/\/$/, ""),
      );
      if (found) {
        targetSlug = found.slug;
        targetTitle = found.title;
        targetFilepath = found.filepath;
      }
    }

    // Add outgoing link if target found and not duplicate
    if (targetSlug && !outgoingLinks.some((link) => link.slug === targetSlug)) {
      outgoingLinks.push({
        slug: targetSlug,
        title: targetTitle,
        filepath: targetFilepath,
      });
    }
  });

  return outgoingLinks;
}

function buildTableOfContents(content) {
  const headings = [];
  const lines = content.split("\n");
  const slugger = new GithubSlugger();

  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = slugger.slug(text);

      headings.push({
        level,
        text,
        id,
      });
    }
  });

  return headings;
}

export function getMarkdownBySlug(slug) {
  const cleanSlug = slug === "/" ? "/" : slug.replace(/\/$/, "");
  const all = getAllMarkdownFiles();
  const item = all.find((x) => x.slug === cleanSlug);

  if (!item) return null;

  const fullPath = path.join("src/vault", item.filepath);

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data: frontmatter, content } = matter(raw);

  const backlinksMap = buildBacklinksMap();
  const backlinks = backlinksMap[item.slug] || [];
  const outgoingLinks = buildOutgoingLinks(content);
  const tableOfContents = buildTableOfContents(content);

  return {
    slug: item.slug,
    title: item.title,
    filepath: item.filepath,
    frontmatter,
    content,
    backlinks,
    outgoingLinks,
    tableOfContents,
  };
}
