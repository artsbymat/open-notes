import { isValidElement } from "react";
import { CustomImage } from "./custom-image";

function containsDivOrImgOrImagePost(node) {
  let found = false;

  function search(child) {
    if (found) return;
    if (!child) return;

    if (Array.isArray(child)) {
      child.forEach(search);
    } else if (isValidElement(child)) {
      if (child.type === CustomImage) {
        found = true;
        return;
      }
      if (child.props && child.props.children) {
        search(child.props.children);
      }
    }
  }

  search(node);
  return found;
}

export function CustomParagraph({ children }) {
  if (containsDivOrImgOrImagePost(children)) {
    return <>{children}</>;
  }
  return <p>{children}</p>;
}
