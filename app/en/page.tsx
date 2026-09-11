import { IndexTicker, SiteFooter, SiteHeader } from "../components/SiteChrome";
import { HomeHeroSlider } from "../components/HomeHeroSlider";
import { HomeArticleSearch } from "../components/HomeArticleSearch";
import { DergiParkLogo } from "../components/DergiParkLogo";
import { archiveArticleListings } from "../archive-listing";
import { calls } from "../site-data";

export default function EnglishHome() {
  return (
    <main lang="en">
      <SiteHeader locale="en" />

      <HomeHeroSlider locale="en" />

      <section className="section latest"><div className="site-shell">
        <HomeArticleSearch articles={archiveArticleListings} locale="en" />
      </div></section>

      <section className="section manifesto"><div className="site-shell manifesto-grid">
        <div className="manifesto-index">BRIQ / 07</div>
        <div className="manifesto-title"><p className="section-kicker light">Journal</p><h2>Reading the world through the eyes of developing countries.</h2></div>
        <div className="manifesto-copy"><p>BRIQ is a quarterly scholarly journal published in Turkish and English, covering international politics, economics, and culture. It discusses the opportunities opened by the Belt and Road Initiative from the perspective of the developing world and common development.</p><div className="manifesto-links"><a href="/en/journal/about-briq">About BRIQ <span>→︎</span></a><a href="/en/journal/publication-principles">Publication Principles <span>→︎</span></a><a href="/en/journal/publication-board">Publication Board <span>→︎</span></a></div></div>
      </div></section>

      <section className="section calls"><div className="site-shell">
        <div className="section-heading split-heading"><div><p className="section-kicker">Call for contributions</p><h2>Open calls for papers</h2></div><a className="underlined-link" href="/en/calls-for-papers">All calls <span>→︎</span></a></div>
        <div className="call-grid">
          {calls.map((call, index) => <a className={`call-card call-card-${index + 1} ${index === 2 ? "call-card-book" : ""}`} href={call.urlEn} key={call.titleEn}>{call.image && <img src={call.image} alt="" aria-hidden="true" loading="lazy" decoding="async" />}{call.image && <div className="call-overlay" />}<div className="call-content"><span className="deadline">{call.statusEn === "Open call" ? call.statusEn : `Deadline: ${call.deadlineEn}`}</span><h3>{call.titleEn}</h3>{index === 2 && <p>{call.summaryEn}</p>}<span className="call-link">View call ↗︎</span></div></a>)}
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
