import Link from "next/link";

export function Backlinks({ links }) {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold uppercase">Backlinks</h3>
      <ul className="space-y-2 text-sm">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.slug}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
