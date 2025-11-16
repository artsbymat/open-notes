import GithubSlugger from "github-slugger";
import { visit } from "unist-util-visit";

export function rehypeSlug() {
  return (tree) => {
    const slugger = new GithubSlugger();
    visit(tree, "element", (node) => {
      if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) {
        const text = node.children
          .map((child) => {
            if (child.type === "text") return child.value;
            if (child.children) {
              return child.children.map((c) => (c.type === "text" ? c.value : "")).join("");
            }
            return "";
          })
          .join("");

        if (text && !node.properties.id) {
          node.properties.id = slugger.slug(text);
        }
      }
    });
  };
}
