"use client";

import { useMemo, useState } from "react";
import { IndexTicker, SiteFooter, SiteHeader } from "../components/SiteChrome";
import { HomeHeroSlider } from "../components/HomeHeroSlider";
import { DergiParkLogo } from "../components/DergiParkLogo";
import { archiveArticles, publicationType } from "../archive";
import { calls } from "../site-data";

export default function EnglishHome() {
  const [query, setQuery] = useState("");
  const visibleArticles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return archiveArticles.slice(0, 5);
    return archiveArticles.filter((article) => `${article.title_en || article.title_tr} ${article.author} ${publicationType(article, "en")}`.toLowerCase().includes(normalized)).slice(0, 6);
  }, [query]);

  return (
    <main lang="en">
      <SiteHeader locale="en" />

      <HomeHeroSlider locale="en" />

      <section className="section latest"><div className="site-shell">
        <div className="section-heading split-heading">
          <div><p className="section-kicker">New from the archive</p><h2>Latest Articles</h2></div>
          <label className="article-search"><span className="sr-only">Search articles</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title or author" /><span aria-hidden="true">⌕</span></label>
        </div>
        <div className="article-list">
          {visibleArticles.map((article, index) => <a className="article-row" href={`/en/articles/${article.slug}`} key={article.slug}><span className="article-number">{String(index + 1).padStart(2, "0")}</span><span className="article-meta"><small>{publicationType(article, "en")}</small><b>{article.author}</b></span><span className="article-title">{article.title_en || article.title_tr}</span><span className="article-arrow">↗︎</span></a>)}
          {visibleArticles.length === 0 && <p className="empty-state">No publication matches this search.</p>}
        </div>
        <a className="underlined-link" href="/en/articles">View all articles <span>→︎</span></a>
      </div></section>

      <section className="section manifesto"><div className="site-shell manifesto-grid">
        <div className="manifesto-index">BRIQ / 07</div>
        <div className="manifesto-title"><p className="section-kicker light">Journal</p><h2>Reading the world through the eyes of developing countries.</h2></div>
        <div className="manifesto-copy"><p>BRIQ is a quarterly scholarly journal published in Turkish and English, covering international politics, economics, and culture. It discusses the opportunities opened by the Belt and Road Initiative from the perspective of the developing world and common development.</p><div className="manifesto-links"><a href="/en/journal/about-briq">About BRIQ <span>→︎</span></a><a href="/en/journal/publication-principles">Publication Principles <span>→︎</span></a><a href="/en/journal/publication-board">Publication Board <span>→︎</span></a></div></div>
      </div></section>

      <section className="section calls"><div className="site-shell">
        <div className="section-heading split-heading"><div><p className="section-kicker">Call for contributions</p><h2>Open calls for papers</h2></div><a className="underlined-link" href="/en/calls-for-papers">All calls <span>→︎</span></a></div>
        <div className="call-grid">
          {calls.map((call, index) => <a className={`call-card call-card-${index + 1} ${index === 2 ? "call-card-book" : ""}`} href={call.urlEn} key={call.titleEn}>{call.image && <img src={call.image} alt="" aria-hidden="true" />}{call.image && <div className="call-overlay" />}<div className="call-content"><span className="deadline">{call.statusEn === "Open call" ? call.statusEn : `Deadline: ${call.deadlineEn}`}</span><h3>{call.titleEn}</h3>{index === 2 && <p>{call.summaryEn}</p>}<span className="call-link">View call ↗︎</span></div></a>)}
        </div>
      </div></section>

      <IndexTicker locale="en" />

      <section className="section author-cta"><div className="site-shell author-cta-inner">
        <div><p className="section-kicker light">For authors</p><h2>Submit your work to BRIQ.</h2><p>Original scholarly work in international politics, economics, and culture is accepted in Turkish or English. There are no submission, evaluation, or publication fees.</p></div>
        <div className="author-actions"><a className="button button-light" href="https://dergipark.org.tr/en/journal/4696/submission/step/manuscript/new"><DergiParkLogo prefix="Submit via" /> <span>↗︎</span></a><a href="/en/for-authors/guidelines">Submission guidelines <span>→︎</span></a><a href="/en/for-authors/review-process">Evaluation process <span>→︎</span></a></div>
      </div></section>

      <SiteFooter locale="en" />
    </main>
  );
}
