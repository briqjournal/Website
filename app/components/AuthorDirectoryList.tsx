"use client";

import { useMemo, useState } from "react";
import { canonicalPageHref } from "../seo-links";

export type DirectoryProfile = {
  id: string;
  name: string;
  affiliation: string;
  role: string;
  works: number;
};

const turkishAlphabet = "A B C Ç D E F G Ğ H I İ J K L M N O Ö P Q R S Ş T U Ü V W X Y Z".split(" ");
const englishAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function folded(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[ıİ]/g, "i").toLowerCase();
}

function initialOf(name: string, locale: "tr" | "en") {
  const first = name.trim().charAt(0);
  const initial = locale === "tr"
    ? first.toLocaleUpperCase("tr-TR")
    : folded(first).toUpperCase();
  return initial || "#";
}

export function AuthorDirectoryList({
  profiles,
  locale,
}: {
  profiles: DirectoryProfile[];
  locale: "tr" | "en";
}) {
  const english = locale === "en";
  const alphabet = english ? englishAlphabet : turkishAlphabet;
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState("");

  const sorted = useMemo(
    () => [...profiles].sort((a, b) => a.name.localeCompare(b.name, english ? "en" : "tr")),
    [profiles, english],
  );
  const availableLetters = useMemo(
    () => new Set(sorted.map((person) => initialOf(person.name, locale))),
    [sorted, locale],
  );
  const normalizedQuery = folded(query.trim());
  const matches = sorted.filter((person) =>
    (!letter || initialOf(person.name, locale) === letter)
    && (!normalizedQuery || folded(person.name + " " + person.affiliation + " " + person.role).includes(normalizedQuery)),
  );
  const groupLetters = [...alphabet, ...[...availableLetters].filter((item) => !alphabet.includes(item))];
  const groups = groupLetters
    .map((initial) => ({
      initial,
      people: matches.filter((person) => initialOf(person.name, locale) === initial),
    }))
    .filter((group) => group.people.length > 0);

  return (
    <section className="author-directory-browser" aria-label={english ? "Browse authors" : "Yazarları inceleyin"}>
      <div className="author-directory-toolbar">
        <label className="author-directory-search">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 5 5" />
          </svg>
          <span className="sr-only">{english ? "Search by name or institution" : "Yazar adı veya kurum ara"}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setLetter(""); }}
            placeholder={english ? "Search by author or institution…" : "Yazar adı veya kurum ara…"}
          />
        </label>
        <div className="author-directory-mode">{english ? "A–Z DIRECTORY" : "A–Z DİZİN"}</div>
      </div>

      <div className="author-directory-alphabet" role="group" aria-label={english ? "Filter by initial" : "Baş harfe göre filtrele"}>
        <button
          type="button"
          className={!letter ? "is-active" : ""}
          aria-pressed={!letter}
          onClick={() => { setLetter(""); setQuery(""); }}
        >
          {english ? "All" : "Tümü"}
        </button>
        {groupLetters.map((initial) => (
          <button
            type="button"
            key={initial}
            className={letter === initial ? "is-active" : ""}
            aria-pressed={letter === initial}
            disabled={!availableLetters.has(initial)}
            onClick={() => { setLetter(initial); setQuery(""); }}
          >
            {initial}
          </button>
        ))}
      </div>

      <div className="author-directory-count" role="status" aria-live="polite">
        {english
          ? String(matches.length) + " of " + String(profiles.length) + " profiles"
          : String(profiles.length) + " profilden " + String(matches.length) + " tanesi"}
      </div>

      {groups.length === 0 && (
        <div className="author-directory-empty">
          <h2>{english ? "No matching authors" : "Eşleşen yazar bulunamadı"}</h2>
          <p>{english ? "Try another name or institution." : "Başka bir isim veya kurumla aramayı deneyin."}</p>
          <button type="button" onClick={() => { setQuery(""); setLetter(""); }}>
            {english ? "Show all profiles" : "Tüm profilleri göster"}
          </button>
        </div>
      )}

      {groups.map((group) => (
        <section key={group.initial} className="author-directory-group" aria-label={group.initial}>
          <div className="author-directory-group-heading">
            <h2>{english ? "AUTHORS" : "YAZARLAR"} / {group.initial}</h2>
            <span>{english ? "SORTED BY NAME" : "ADA GÖRE SIRALI"}</span>
          </div>
          <div className="author-directory-entries">
            {group.people.map((person) => (
              <a
                key={person.id}
                className="author-directory-entry"
                href={canonicalPageHref(english ? "/en/authors/" + person.id : "/tr/yazar/" + person.id)}
              >
                <span className="author-directory-monogram" aria-hidden="true">
                  {initialOf(person.name, locale)}
                </span>
                <span className="author-directory-person">
                  <strong>{person.name}</strong>
                  <span>{person.affiliation || person.role || (english ? "Author" : "Yazar")}</span>
                </span>
                <span className="author-directory-work-count">
                  {person.works > 0
                    ? String(person.works) + (english ? (person.works === 1 ? " work" : " works") : " yayın")
                    : person.role || ""}
                </span>
                <span className="author-directory-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
