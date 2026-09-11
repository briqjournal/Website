"use client";

import { useEffect, useState } from "react";

type ArticleSearchIndex = Record<string, string>;

let cachedIndex: ArticleSearchIndex | null = null;
let pendingIndex: Promise<ArticleSearchIndex> | null = null;

function loadIndex() {
  if (cachedIndex) return Promise.resolve(cachedIndex);
  pendingIndex ||= fetch("/assets/data/article-search-index.json", {
    headers: { Accept: "application/json" },
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Search index returned ${response.status}`);
      return response.json() as Promise<ArticleSearchIndex>;
    })
    .then((index) => {
      cachedIndex = index;
      return index;
    })
    .finally(() => {
      pendingIndex = null;
    });
  return pendingIndex;
}

export function useArticleSearchIndex(enabled: boolean) {
  const [index, setIndex] = useState<ArticleSearchIndex | null>(cachedIndex);

  useEffect(() => {
    if (!enabled || index) return;
    let active = true;
    loadIndex()
      .then((loaded) => {
        if (active) setIndex(loaded);
      })
      .catch(() => {
        // Title, author, and DOI search remains available if the optional
        // abstract index cannot be fetched.
      });
    return () => {
      active = false;
    };
  }, [enabled, index]);

  return index;
}

