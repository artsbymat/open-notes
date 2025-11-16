import { ExternalLink } from "lucide-react";
import Link from "next/link";

export function CustomAnchor(props) {
  const {
    href = "",
    children,
    className,
    tabIndex,
    "aria-label": ariaLabel,
    "aria-hidden": ariaHidden,
    "data-footnote-backref": dataFootnoteBackref,
    ...rest
  } = props;

  const isAnchor = href.startsWith("#");

  const isExternal =
    href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");

  // open in new tab
  if (isExternal) {
    return (
      <a
        href={href}
        className={className}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        data-footnote-backref={dataFootnoteBackref}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
        <ExternalLink className="inline-block size-3 align-text-top" />
      </a>
    );
  }

  // use Link with replace to avoid adding a history entry
  if (isAnchor) {
    return (
      <Link
        href={href}
        replace
        className={className}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        data-footnote-backref={dataFootnoteBackref}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      data-footnote-backref={dataFootnoteBackref}
      {...rest}
    >
      {children}
    </Link>
  );
}
