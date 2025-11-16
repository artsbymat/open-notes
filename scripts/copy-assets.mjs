import fs from "fs";
import path from "path";
import fg from "fast-glob";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import GithubSlugger from "github-slugger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDIA_EXTENSIONS = [
  // Images
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
  // Videos
  "mp4",
  "webm",
  "mov",
  "avi",
  "mkv",
  // Audio
  "mp3",
  "wav",
  "ogg",
  "m4a",
  "flac",
  // Documents
  "pdf"
];

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

async function loadConstants() {
  const constantsPath = path.resolve(__dirname, "..", "src", "constants.js");
  const module = await import(`file://${constantsPath}`);
  return {
    PUBLISH_MODE: module.PUBLISH_MODE,
    EXCLUDE_FOLDER: module.EXCLUDE_FOLDER
  };
}

function removeCodeBlocks(content) {
  let cleaned = content;

  // Remove fenced code blocks (``` or ~~~)
  cleaned = cleaned.replace(/^```[\s\S]*?^```/gm, "");
  cleaned = cleaned.replace(/^~~~[\s\S]*?^~~~/gm, "");

  // Remove inline code `code`
  cleaned = cleaned.replace(/`[^`\n]+`/g, "");

  // Remove indented code blocks (4 spaces or tab at start of line)
  cleaned = cleaned.replace(/^(?: {4}|\t).+$/gm, "");

  return cleaned;
}

function transformObsidianLinksInSvg() {
  const projectRoot = path.resolve(__dirname, "..");
  const assetsDir = path.join(projectRoot, "public", "content", "assets");

  console.log("\n🔗 Transforming Obsidian links in .excalidraw.svg files...");

  // Find all .excalidraw.svg files
  const svgFiles = fg.sync(`${assetsDir}/**/*.excalidraw.svg`);

  if (svgFiles.length === 0) {
    console.log("   No .excalidraw.svg files found");
    return;
  }

  console.log(`   Found ${svgFiles.length} .excalidraw.svg files`);

  let transformedCount = 0;

  svgFiles.forEach((filePath) => {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // Helper function to transform Obsidian path to Next.js path
    const transformPath = (encodedPath, tagType) => {
      // Validate that we have a path
      if (!encodedPath || encodedPath.trim().length === 0) {
        console.log(`   ⚠️  Skipped empty path in ${tagType}: ${path.basename(filePath)}`);
        return null;
      }

      try {
        // Decode URL encoding
        const decodedPath = decodeURIComponent(encodedPath);

        // Split path by '/'
        const pathParts = decodedPath.split("/").filter(part => part.trim().length > 0);

        // Validate we have path parts
        if (pathParts.length === 0) {
          console.log(`   ⚠️  Skipped invalid path in ${tagType}: ${encodedPath}`);
          return null;
        }

        // Convert each part to slug
        const slugger = new GithubSlugger();
        const slugParts = pathParts.map((part) => slugger.slug(part));

        // Create Next.js path
        return "/" + slugParts.join("/");
      } catch (error) {
        console.log(`   ⚠️  Error processing path in ${tagType} "${encodedPath}": ${error.message}`);
        return null;
      }
    };

    // Match Obsidian links in <a> tags: obsidian://open?vault=<any-vault>&file=...
    // Handles both &file= and &amp;file= variations
    const obsidianLinkRegex = /<a\s+href="obsidian:\/\/open\?vault=[^&"]+&(?:amp;)?file=([^"]+)"/gi;

    content = content.replace(obsidianLinkRegex, (match, encodedPath) => {
      const nextjsPath = transformPath(encodedPath, '<a>');
      if (nextjsPath) {
        modified = true;
        return `<a href="${nextjsPath}"`;
      }
      return match;
    });

    // Match Obsidian links in <iframe> tags
    const obsidianIframeRegex = /<iframe\s+src="obsidian:\/\/open\?vault=[^&"]+&(?:amp;)?file=([^"]+)"/gi;

    content = content.replace(obsidianIframeRegex, (match, encodedPath) => {
      const nextjsPath = transformPath(encodedPath, '<iframe>');
      if (nextjsPath) {
        modified = true;
        return `<iframe src="${nextjsPath}"`;
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      transformedCount++;
      const relativePath = path.relative(assetsDir, filePath);
      console.log(`   ✓ Transformed: ${relativePath}`);
    }
  });

  console.log(`   ✅ Transformed ${transformedCount} files`);
}

function extractAssetReferences(content) {
  const assets = new Set();

  // Remove all code blocks and inline code first
  const cleanedContent = removeCodeBlocks(content);

  // Extract embedded wikilinks: ![[asset]]
  const embedRegex = /!\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = embedRegex.exec(cleanedContent)) !== null) {
    let assetPath = match[1].trim();
    // Remove heading references
    assetPath = assetPath.split("#")[0].trim();
    // Remove alias
    assetPath = assetPath.split("|")[0].trim();
    if (assetPath) {
      // Check if it's likely a media file
      const ext = assetPath.split(".").pop()?.toLowerCase();
      if (ext && MEDIA_EXTENSIONS.includes(ext)) {
        assets.add(assetPath);
      }
    }
  }

  // Extract markdown images: ![alt](path)
  const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  while ((match = mdImageRegex.exec(cleanedContent)) !== null) {
    const assetPath = match[2].trim();
    // Only include relative paths (not URLs or anchors)
    if (
      !assetPath.startsWith("http://") &&
      !assetPath.startsWith("https://") &&
      !assetPath.startsWith("#") &&
      assetPath.length > 0
    ) {
      assets.add(assetPath);
    }
  }

  return Array.from(assets);
}

async function copyAssets() {
  const projectRoot = path.resolve(__dirname, "..");
  const sourceDir = path.join(projectRoot, "src", "vault");
  const targetDir = path.join(projectRoot, "public", "content", "assets");

  console.log("🚀 Starting asset copy process...");
  console.log(`📂 Source: ${sourceDir}`);
  console.log(`📁 Target: ${targetDir}`);

  // Load constants
  const { PUBLISH_MODE, EXCLUDE_FOLDER } = await loadConstants();
  console.log(`📌 PUBLISH_MODE: ${PUBLISH_MODE}`);

  // Clean target directory
  console.log("\n🧹 Cleaning target directory...");
  removeDirectory(targetDir);
  fs.mkdirSync(targetDir, { recursive: true });
  console.log("✅ Target directory cleaned and recreated");

  // Get all markdown files
  const ignorePatterns = EXCLUDE_FOLDER.map((dir) => path.join(sourceDir, dir, "**"));
  const markdownFiles = fg.sync(`${sourceDir}/**/*.md`, { ignore: ignorePatterns });

  // Extract asset references from published content
  const referencedAssets = new Set();

  console.log(`\n📄 Scanning ${markdownFiles.length} markdown files...`);

  markdownFiles.forEach((mdFile) => {
    const content = fs.readFileSync(mdFile, "utf8");
    const { data, content: mdContent } = matter(content);

    // Skip if PUBLISH_MODE is enabled and file is not published
    if (PUBLISH_MODE && !data.publish) {
      return;
    }

    // Extract asset references from this file
    const assets = extractAssetReferences(mdContent);
    assets.forEach((asset) => referencedAssets.add(asset));
  });

  console.log(`📊 Found ${referencedAssets.size} referenced assets`);

  // Find all media files in vault
  const patterns = MEDIA_EXTENSIONS.map((ext) => `${sourceDir}/**/*.${ext}`);
  const allMediaFiles = fg.sync(patterns, { caseSensitiveMatch: false });

  // Build a map of filenames to full paths
  const mediaFileMap = new Map();
  allMediaFiles.forEach((filePath) => {
    const relativePath = path.relative(sourceDir, filePath);
    const filename = path.basename(filePath);
    const filenameWithoutExt = path.basename(filePath, path.extname(filePath));

    // Store by various keys for flexible matching
    mediaFileMap.set(relativePath.toLowerCase(), filePath);
    mediaFileMap.set(filename.toLowerCase(), filePath);
    mediaFileMap.set(filenameWithoutExt.toLowerCase(), filePath);
    mediaFileMap.set(relativePath.toLowerCase().replace(/\\/g, "/"), filePath);
  });

  // Copy only referenced assets
  let copiedCount = 0;
  const copiedFiles = new Set();

  referencedAssets.forEach((assetRef) => {
    const assetRefLower = assetRef.toLowerCase();
    const assetRefNormalized = assetRefLower.replace(/\\/g, "/");

    // Try to find the file
    let sourceFile =
      mediaFileMap.get(assetRefLower) ||
      mediaFileMap.get(assetRefNormalized) ||
      mediaFileMap.get(path.basename(assetRefLower)) ||
      mediaFileMap.get(path.basename(assetRefLower, path.extname(assetRefLower)));

    if (sourceFile && !copiedFiles.has(sourceFile)) {
      const relativePath = path.relative(sourceDir, sourceFile);
      const targetFile = path.join(targetDir, relativePath);
      const targetFileDir = path.dirname(targetFile);

      // Create target directory if it doesn't exist
      if (!fs.existsSync(targetFileDir)) {
        fs.mkdirSync(targetFileDir, { recursive: true });
      }

      fs.copyFileSync(sourceFile, targetFile);
      copiedFiles.add(sourceFile);
      copiedCount++;
      console.log(`  ✓ Copied: ${relativePath}`);
    } else if (!sourceFile) {
      console.log(`  ⚠️  Not found: ${assetRef}`);
    }
  });

  console.log(`\n✨ Asset copy complete!`);
  console.log(`   📋 Referenced assets: ${referencedAssets.size}`);
  console.log(`   ✅ Copied: ${copiedCount}`);
  console.log(`   ⚠️  Not found: ${referencedAssets.size - copiedCount}`);
}

// Run the script
try {
  await copyAssets();
  transformObsidianLinksInSvg();
} catch (error) {
  console.error("❌ Error copying assets:", error);
  process.exit(1);
}
