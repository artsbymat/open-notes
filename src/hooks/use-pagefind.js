"use client";

import { useCallback, useEffect, useState } from "react";

const importPageFind = async (path) => await new Function(`return import("${path}")`)();

export const usePagefind = () => {
  const [search, setSearch] = useState("");
  const [isError, setIsError] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const catchErrors = useCallback(() => {
    setIsError(true);
    window.pagefind = {
      search: () => Promise.resolve({ results: [], query: "" }),
      preload: () => Promise.resolve()
    };
  }, []);

  const rejectionHandler = (event) => {
    console.log(event);
    if (event.reason?.message?.includes("Pagefind")) {
      catchErrors();
    }
  };

  useEffect(() => {
    async function loadPagefind() {
      if (typeof window.pagefind === "undefined") {
        try {
          const isDev = process.env.NODE_ENV === "development";
          const fullPath = isDev ? `/pagefind/pagefind.js` : `/_next/static/pagefind/pagefind.js`;
          const res = await fetch(fullPath, {
            method: "HEAD",
            cache: "no-store"
          });

          if (res.status == 404) throw Error("file not found");

          const pagefind = await importPageFind(fullPath);

          window.pagefind = pagefind;

          await window.pagefind.preload().catch((e) => {
            console.log(e);
            catchErrors();
          });
        } catch (e) {
          console.log(e);
          catchErrors();
        }
      }
    }

    window.addEventListener("unhandledrejection", rejectionHandler);

    loadPagefind();

    return () => {
      window.removeEventListener("unhandledrejection", rejectionHandler);
    };
  }, [catchErrors]);

  async function handleSearch(s) {
    if (window.pagefind) {
      const res = await window.pagefind.search(s);

      const result = [];

      for await (const d of res.results) {
        const data = await d?.data();
        result.push(data);
      }

      setResults(result);
    }
  }

  const onSearch = async (s) => {
    setSearch(s);
    if (!isError) {
      setLoading(true);
      await handleSearch(s);
      setLoading(false);
    }
  };

  return { isError, results, loading, onSearch, search, setSearch, setLoading };
};

export default usePagefind;
