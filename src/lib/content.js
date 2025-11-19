import fs from "fs";
import path from "path";
import fg from "fast-glob";
import matter from "gray-matter";
import { EXCLUDE_FOLDER, PUBLISH_MODE } from "@/constants";
import GithubSlugger, { slug as slugify } from "github-slugger";

// Unified cache object to store computed items, backlinks, and media assets
let cache = null; // { items: Array, backlinks: Object, mediaAssets: Object }

export function getAllMarkdownFiles(options = {}) {
  const opts = {
    baseDir: "src/vault",
    exclude: ["Templates"],
    ...options
  };

  if (cache?.items?.length) return cache.items;

  const { baseDir, exclude } = opts;
  const basePath = path.resolve(baseDir);

  const ignorePatterns = (EXCLUDE_FOLDER?.length ? EXCLUDE_FOLDER : exclude).map((dir) =>
    path.join(basePath, dir, "**")
  );

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
          title: data.title || "index"
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
        title
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));

  cache = { ...(cache || {}), items };

  return cache.items;
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
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("#")) {
      links.push(url);
    }
  }

  return links;
}

function buildBacklinksMap() {
  if (cache?.backlinks) return cache.backlinks;

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
          (item) => item.slug === cleanLink || item.slug === cleanLink.replace(/\/$/, "")
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
          filepath: sourceItem.filepath
        });
      }
    });
  });

  // Remove duplicate
  Object.keys(backlinks).forEach((slug) => {
    const uniqueBacklinks = [];
    const seen = new Set();

    backlinks[slug].forEach((backlink) => {
      const key = `${backlink.slug}-${backlink.title}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueBacklinks.push(backlink);
      }
    });

    backlinks[slug] = uniqueBacklinks;
  });

  cache = { ...(cache || {}), backlinks };
  return cache.backlinks;
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
        (item) => item.slug === cleanLink || item.slug === cleanLink.replace(/\/$/, "")
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
        filepath: targetFilepath
      });
    }
  });

  return outgoingLinks;
}

function buildTableOfContents(content) {
  const headings = [];
  const lines = content.split("\n");
  const slugger = new GithubSlugger();

  // Helper to strip common inline markdown syntaxes so slug matches rehype text extraction
  const stripInlineMarkdown = (str) => {
    return (
      str
        // Images ![alt](url) -> alt
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        // Links [text](url) -> text
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        // Inline code `code` -> code
        .replace(/`([^`]+)`/g, "$1")
        // Bold/italic markers * _ ~ ** __ ~~ -> remove markers only
        .replace(/[\*_~]{1,3}([^\*_~]+)[\*_~]{1,3}/g, "$1")
        // HTML tags -> remove
        .replace(/<[^>]+>/g, "")
        // Escape backslashes
        .replace(/\\([#`*_{}\[\]()!+\-.>~|])/g, "$1")
        .trim()
    );
  };

  let inFence = false;
  let fenceMarker = null; // ``` or ~~~

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Toggle fenced code block detection
    const fenceMatch = line.match(/^([`~]{3,})(.*)$/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = null;
      }
      continue;
    }

    if (inFence) continue; // ignore headings inside code fences

    // ATX headings: # ... ######
    const atx = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (atx) {
      const level = atx[1].length;
      const rawText = atx[2].trim();
      const text = stripInlineMarkdown(rawText);
      const id = slugger.slug(text);
      headings.push({ level, text, id });
      continue;
    }

    // Setext headings: h1/h2 using === or --- underline
    if (i + 1 < lines.length) {
      const underline = lines[i + 1];
      const setext = underline.match(/^\s*(=+|-+)\s*$/);
      if (setext && line.trim().length > 0) {
        const level = setext[1][0] === "=" ? 1 : 2;
        const rawText = line.trim();
        const text = stripInlineMarkdown(rawText);
        const id = slugger.slug(text);
        headings.push({ level, text, id });
        i++; // skip underline line
      }
    }
  }

  return headings;
}

export function getMarkdownBySlug(slug) {
  const cleanSlug = slug === "/" ? "/" : slug.replace(/\/$/, "");
  const all = getAllMarkdownFiles();
  const item = all.find((x) => x.slug === cleanSlug);

  if (!item) {
    // Check if this slug represents a folder with files/subfolders but no index.md
    const folderPrefix = cleanSlug === "/" ? "/" : cleanSlug + "/";
    const filesInFolder = all.filter((x) => {
      if (cleanSlug === "/") {
        // Root level: files that don't contain any slash
        return !x.slug.includes("/") || x.slug === "/";
      }
      // Check if file is directly in this folder (not in subfolders)
      return x.slug.startsWith(folderPrefix) && !x.slug.slice(folderPrefix.length).includes("/");
    });

    // Detect subfolders with real folder names
    const subfoldersMap = new Map(); // slug -> real folder name
    all.forEach((x) => {
      const relativePath = x.filepath;
      const pathParts = relativePath.split(path.sep);

      if (cleanSlug === "/") {
        // Root level: extract first segment if it contains a slash
        const match = x.slug.match(/^\/([^/]+)\//);
        if (match && pathParts.length > 1) {
          const slugPart = match[1];
          const realName = pathParts[0]; // First directory in path
          subfoldersMap.set(slugPart, realName);
        }
      } else if (x.slug.startsWith(folderPrefix)) {
        // Extract immediate subfolder name
        const remainder = x.slug.slice(folderPrefix.length);
        const match = remainder.match(/^([^/]+)\//);
        if (match) {
          const slugPart = match[1];
          const depth = cleanSlug.split("/").filter(Boolean).length;
          if (pathParts.length > depth) {
            const realName = pathParts[depth]; // Folder at current depth
            subfoldersMap.set(slugPart, realName);
          }
        }
      }
    });

    const folders = Array.from(subfoldersMap.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([slugPart, realName]) => ({
        slug: cleanSlug === "/" ? `/${slugPart}` : `${cleanSlug}/${slugPart}`,
        title: realName,
        isFolder: true
      }));

    if (filesInFolder.length > 0 || folders.length > 0) {
      // Get real folder name from filesystem
      let folderTitle = "Home";
      if (cleanSlug !== "/") {
        // Find a file in this folder or subfolder to extract the real folder name
        const sampleFile = all.find((x) => x.slug.startsWith(folderPrefix));
        if (sampleFile) {
          const relativePath = sampleFile.filepath;
          const slugParts = cleanSlug.split("/").filter(Boolean);
          const pathParts = relativePath.split(path.sep);
          // Get the folder name at the same depth as the slug
          if (pathParts.length > slugParts.length) {
            folderTitle = pathParts[slugParts.length - 1];
          } else {
            folderTitle = pathParts[pathParts.length - 2] || path.basename(cleanSlug);
          }
        } else {
          folderTitle = path.basename(cleanSlug);
        }
      }

      // Return folder listing with both files and subfolders
      // Filter out index.md files as they represent folders, not regular files
      const regularFiles = filesInFolder.filter((f) => !f.filepath.endsWith("index.md"));

      return {
        isFolder: true,
        slug: cleanSlug,
        title: folderTitle,
        files: regularFiles.map((f) => ({
          slug: f.slug,
          title: f.title,
          filepath: f.filepath
        })),
        folders: folders
      };
    }

    return null;
  }

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
    tableOfContents
  };
}

export function getAllSlugs() {
  const all = getAllMarkdownFiles();
  return all
    .filter((item) => item.slug !== "/")
    .map((item) => ({
      slug: item.slug.replace(/^\//, "").split("/").filter(Boolean)
    }));
}

export function getAllMediaAssets() {
  if (cache?.mediaAssets) return cache.mediaAssets;

  const basePath = path.resolve("src/vault");
  const mediaExtensions = [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "svg",
    "webp",
    "bmp",
    "ico",
    "tiff",
    "avif",
    "mp4",
    "webm",
    "mov",
    "avi",
    "mkv",
    "mp3",
    "wav",
    "ogg",
    "m4a",
    "flac",
    "pdf",
    "doc",
    "docx",
    "ppt",
    "pptx",
    "xls",
    "xlsx"
  ];

  const patterns = mediaExtensions.map((ext) => `${basePath}/**/*.${ext}`);
  const files = fg.sync(patterns, { caseSensitiveMatch: false });

  const mediaAssets = {};

  files.forEach((filepath) => {
    const rel = path.relative(basePath, filepath);
    const filename = path.basename(filepath);
    const filenameLower = filename.toLowerCase();
    const filenameWithoutExt = path.basename(filepath, path.extname(filepath));
    const filenameWithoutExtLower = filenameWithoutExt.toLowerCase();

    // Public URL path
    const publicUrl = `/content/assets/${rel.split(path.sep).join("/")}`;

    // Store multiple lookup keys for flexibility
    if (!mediaAssets[filenameLower]) {
      mediaAssets[filenameLower] = publicUrl;
    }
    if (!mediaAssets[filenameWithoutExtLower]) {
      mediaAssets[filenameWithoutExtLower] = publicUrl;
    }

    // Also store with relative path for more specific lookups
    const relLower = rel.toLowerCase().split(path.sep).join("/");
    mediaAssets[relLower] = publicUrl;
  });

  cache = { ...(cache || {}), mediaAssets };
  return cache.mediaAssets;
}

function extractTagsFromContent(rawContent) {
  const lines = rawContent.split("\n");
  const tags = new Set();

  let insideCodeBlock = false;

  for (let line of lines) {
    const trimmed = line.trim();

    // Detect code fences
    if (trimmed.startsWith("```")) {
      insideCodeBlock = !insideCodeBlock;
      continue;
    }
    if (insideCodeBlock) continue;

    // Remove wikilinks entirely
    let cleanLine = trimmed.replace(/\[\[[^\]]+\]\]/g, "");

    // Skip images
    if (/!\[[^\]]*\]\([^)]+\)/.test(cleanLine)) continue;

    // Skip link-only line
    if (/^\[[^\]]+\]\([^)]+\)$/.test(cleanLine)) continue;

    // Skip HTML/component-like
    if (cleanLine.startsWith("<") && cleanLine.endsWith(">")) continue;

    // Remove inline code
    cleanLine = cleanLine.replace(/`([^`]+)`/g, "");

    // Only allow paragraphs & list items
    const isParagraph = /^[A-Za-z0-9#]/.test(cleanLine);
    const isList = /^[-*+]\s+|^\d+\.\s+/.test(cleanLine);
    if (!isParagraph && !isList) continue;

    // Extract #tag
    const tagRegex = /#([a-zA-Z0-9/_-]+)/g;
    let match;

    while ((match = tagRegex.exec(cleanLine)) !== null) {
      let tag = match[1].trim();

      // Convert "ini/tag" → "ini%2Ftag"
      if (tag.includes("/")) {
        tag = tag.replace(/\//g, "%2F");
      }

      tags.add(tag);
    }
  }

  return Array.from(tags);
}

export function getAllTags() {
  const all = getAllMarkdownFiles();
  const allTags = new Set();

  for (const item of all) {
    const fullPath = path.join("src/vault", item.filepath);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);

    // Frontmatter tags
    if (Array.isArray(data.tags)) {
      data.tags.forEach((tag) => {
        if (typeof tag === "string") {
          const clean = tag.replace(/^\#/, "").replace(/\//g, "%2F");
          allTags.add(clean);
        }
      });
    }

    // Content tags
    extractTagsFromContent(content).forEach((tag) => allTags.add(tag));
  }

  return Array.from(allTags).sort();
}

export function getPostsByTag(requestedTag) {
  const encodedTag = requestedTag.replace(/\//g, "%2F");

  const all = getAllMarkdownFiles();
  const results = [];

  for (const item of all) {
    const fullPath = path.join("src/vault", item.filepath);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);

    let tags = [];

    // Frontmatter
    if (Array.isArray(data.tags)) {
      tags.push(...data.tags.map((t) => t.replace(/^\#/, "").replace(/\//g, "%2F")));
    }

    // Content tags
    tags.push(...extractTagsFromContent(content));

    if (tags.includes(encodedTag)) {
      results.push({
        slug: item.slug,
        title: item.title,
        filepath: item.filepath
      });
    }
  }

  return results.sort((a, b) => a.title.localeCompare(b.title));
}
