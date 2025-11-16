import { visit } from "unist-util-visit";
import { getAllMarkdownFiles, getAllMediaAssets } from "@/lib/content";

export function remarkWikilink() {
  return (tree) => {
    const cache = getAllMarkdownFiles();
    const mediaAssets = getAllMediaAssets();

    // Build lookup maps
    const titleToSlug = {};
    const filepathToSlug = {};
    cache.forEach((item) => {
      titleToSlug[item.title.toLowerCase()] = item.slug;
      const pathWithoutExt = item.filepath.replace(/\.md$/, "");
      filepathToSlug[pathWithoutExt.toLowerCase()] = item.slug;
    });

    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof node.value !== "string") return;

      const text = node.value;
      // Match wikilinks: [[link]] or [[link|alias]] or [[link#heading]] or [[link#heading|alias]]
      // Also match embeds: ![[link]]
      const wikilinkRegex = /(!?)\[\[([^\]]+)\]\]/g;
      const matches = [];
      let match;

      while ((match = wikilinkRegex.exec(text)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          isEmbed: match[1] === "!",
          content: match[2]
        });
      }

      if (matches.length === 0) return;

      // Split the text node into multiple nodes
      const newNodes = [];
      let lastIndex = 0;

      matches.forEach((wikilink) => {
        // Add text before wikilink
        if (wikilink.index > lastIndex) {
          newNodes.push({
            type: "text",
            value: text.slice(lastIndex, wikilink.index)
          });
        }

        // Parse wikilink content
        const { content, isEmbed } = wikilink;
        let link = content;
        let alias = null;
        let heading = null;

        // Check for custom text: [[link|alias]]
        const pipeSplit = content.split("|");
        if (pipeSplit.length > 1) {
          link = pipeSplit[0].trim();
          alias = pipeSplit.slice(1).join("|").trim();
        }

        // Check for heading: [[link#heading]]
        const hashSplit = link.split("#");
        if (hashSplit.length > 1) {
          link = hashSplit[0].trim();
          heading = hashSplit.slice(1).join("#").trim();
        }

        // Resolve link to slug or media asset
        const linkLower = link.toLowerCase();
        let targetSlug = null;
        let isMediaAsset = false;

        // First check if it's a media asset
        const mediaUrl =
          mediaAssets[linkLower] ||
          mediaAssets[linkLower.split("/").pop()] ||
          mediaAssets[linkLower.replace(/\.[^.]+$/, "")];

        if (mediaUrl) {
          targetSlug = mediaUrl;
          isMediaAsset = true;
        } else if (titleToSlug[linkLower]) {
          targetSlug = titleToSlug[linkLower];
        } else if (filepathToSlug[linkLower]) {
          targetSlug = filepathToSlug[linkLower];
        } else {
          const cleanLink = link.startsWith("/") ? link : `/${link}`;
          const foundItem = cache.find(
            (item) => item.slug === cleanLink || item.slug === cleanLink.replace(/\/$/, "")
          );
          if (foundItem) {
            targetSlug = foundItem.slug;
          }
        }

        // Build final URL
        let url = targetSlug || `/${link}`;
        if (heading && !isMediaAsset) {
          // Convert heading to slug format (lowercase, hyphenated)
          const headingSlug = heading
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");
          url += `#${headingSlug}`;
        }

        // Determine display text
        const displayText = alias || link;

        if (isEmbed) {
          // Handle embeds: ![[Image.png]] or ![[Document.pdf]]
          const ext = link.split(".").pop().toLowerCase();
          const imageExts = ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp"];

          if (imageExts.includes(ext)) {
            // Embed as image
            // If alias is a number (size), preserve it in format "link|size" for CustomImage
            const altText = alias && /^\d+$/.test(alias) ? `${link}|${alias}` : displayText;

            newNodes.push({
              type: "image",
              url: url,
              alt: altText,
              title: displayText
            });
          } else {
            // Embed as link (for documents)
            newNodes.push({
              type: "link",
              url: url,
              children: [
                {
                  type: "text",
                  value: `📎 ${displayText}`
                }
              ]
            });
          }
        } else {
          // Regular wikilink as markdown link
          newNodes.push({
            type: "link",
            url: url,
            children: [
              {
                type: "text",
                value: displayText
              }
            ]
          });
        }

        lastIndex = wikilink.index + wikilink.length;
      });

      // Add remaining text
      if (lastIndex < text.length) {
        newNodes.push({
          type: "text",
          value: text.slice(lastIndex)
        });
      }

      // Replace the text node with new nodes
      parent.children.splice(index, 1, ...newNodes);

      // Return index to continue visiting from the correct position
      return index + newNodes.length;
    });
  };
}
