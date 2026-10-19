"use client";

import { useMemo, useSyncExternalStore } from "react";
import { readSearchState, writeSearchState, type SearchKind, type SearchState } from "../search-state";

const eventName = "briq-search-change";
function subscribe(listener: () => void) {
  window.addEventListener("popstate", listener);
  window.addEventListener(eventName, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(eventName, listener);
  };
}
const snapshot = () => window.location.search;
const serverSnapshot = () => "";

export function useSearchUrlState(defaultKind: SearchKind) {
  const search = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const state = useMemo(() => readSearchState(search, defaultKind), [search, defaultKind]);
  const update = (patch: Partial<SearchState>) => {
    const current = readSearchState(window.location.search, defaultKind);
    const params = writeSearchState(window.location.search, { ...current, ...patch }, defaultKind);
    const url = `${window.location.pathname}${params ? `?${params}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new Event(eventName));
  };
  return { state, update };
}
