"use client";

import { useState } from "react";
import { Search, Loader2, FileText } from "lucide-react";
import { Input } from "./ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePagefind } from "@/hooks/use-pagefind";
import Link from "next/link";

export function SearchInput() {
  const { isError, results, loading, onSearch, search } = usePagefind();
  const [open, setOpen] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    onSearch(value);
    setOpen(value.length >= 3);
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  const processUrl = (url) => {
    return url
      .replace("/_next/static/server/app", "")
      .replace("/server/app", "")
      .replace(".html", "");
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild className="w-full">
          <div className="relative mx-0 mt-2 w-full px-2">
            {loading ? (
              <Loader2 className="text-muted-foreground absolute top-0 bottom-0 left-5 my-auto size-4 animate-spin" />
            ) : (
              <Search className="text-muted-foreground absolute top-0 bottom-0 left-5 my-auto size-4" />
            )}
            <Input
              type="search"
              placeholder="Search"
              className="pr-4 pl-8"
              value={search}
              onChange={handleInputChange}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-[var(--radix-popover-trigger-width)] overflow-y-auto"
        >
          {isError && (
            <div className="text-muted-foreground px-2 text-sm">
              Search is currently unavailable
            </div>
          )}

          {!isError && results.length > 0 && (
            <ScrollArea className="h-72">
              {results.map((result, index) => {
                const cleanUrl = processUrl(result.url);

                return (
                  <Link
                    key={index}
                    href={cleanUrl}
                    className="hover:bg-border block rounded-md p-3 transition-colors"
                    onClick={handleLinkClick}
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="text-muted-foreground mt-0.5 size-4 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground truncate text-sm font-medium">
                          {result.meta?.title || cleanUrl}
                        </div>
                        {result.excerpt && (
                          <div
                            className="text-muted-foreground mt-1 line-clamp-2 text-xs"
                            dangerouslySetInnerHTML={{ __html: result.excerpt }}
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </ScrollArea>
          )}

          {!isError && results.length === 0 && !loading && search.length < 3 && (
            <div className="text-muted-foreground px-2 text-sm">
              Please enter at least 3 characters to search
            </div>
          )}

          {!isError && results.length === 0 && !loading && search.length >= 3 && (
            <div className="text-muted-foreground px-2 text-sm">No results found for {search}</div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
