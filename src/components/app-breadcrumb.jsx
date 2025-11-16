"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";

export function AppBreadcrumb({ allMarkdownFiles = [] }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const paths = segments.map((_, i) => "/" + segments.slice(0, i + 1).join("/"));

  const pageExists = allMarkdownFiles.some((file) => file.slug === pathname);

  const folderPrefix = pathname === "/" ? "/" : pathname + "/";
  const hasChildrenFiles = allMarkdownFiles.some((file) => file.slug.startsWith(folderPrefix));

  if (!pageExists && !hasChildrenFiles) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.length > 0 && <BreadcrumbSeparator />}

        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          const href = paths[i];
          const file = allMarkdownFiles.find((f) => f.slug === href);

          let displayTitle = file?.title || seg;
          if (!file) {
            const folderPrefix = href + "/";
            const childFile = allMarkdownFiles.find((f) => f.slug.startsWith(folderPrefix));
            if (childFile) {
              const pathParts = childFile.filepath.split("/");
              const depth = href.split("/").filter(Boolean).length;
              if (pathParts.length > depth) {
                displayTitle = pathParts[depth - 1];
              }
            }
          }

          if (isLast) {
            return (
              <BreadcrumbItem key={i}>
                <BreadcrumbPage>{displayTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            );
          }

          return (
            <Fragment key={i}>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href={href}>{displayTitle}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
