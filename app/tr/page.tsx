import { IndexTicker, SiteFooter, SiteHeader } from "../components/SiteChrome";
import { HomeHeroSlider } from "../components/HomeHeroSlider";
import { HomeArticleSearch } from "../components/HomeArticleSearch";
import { DergiParkLogo } from "../components/DergiParkLogo";
import { CallDeadline } from "../components/CallDeadline";
import { archiveArticleListings } from "../archive-listing";
import { calls } from "../site-data";

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <HomeHeroSlider />

      <section className="section latest">
        <div className="site-shell">
          <HomeArticleSearch articles={archiveArticleListings} />
        </div>
      </section>

      <section className="section manifesto">
        <div className="site-shell manifesto-grid">
          <div className="manifesto-index">BRIQ / 07</div>
          <div className="manifesto-title">
            <p className="section-kicker light">Dergi</p>
            <h2>Dünyayı gelişen ülkelerin gözüyle okumak.</h2>
          </div>
          <div className="manifesto-copy">
            <p>
              BRIQ, uluslararası siyaset, ekonomi ve kültür alanlarında Türkçe
              ve İngilizce yayımlanan üç aylık bilimsel bir dergidir. Kuşak ve
              Yol Girişimi’nin açtığı olanakları, gelişen dünyanın bilgi birikimi
              ve ortak kalkınma perspektifiyle tartışır.
            </p>
            <div className="manifesto-links">
              <a href="/tr/dergi/briq-hakkinda">
                BRIQ Hakkında <span>→︎</span>
              </a>
              <a href="/tr/dergi/yayin-ilkeleri">
                Yayın İlkeleri <span>→︎</span>
              </a>
              <a href="/tr/dergi/yayin-kurulu">
                Yayın Kurulu <span>→︎</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section calls">
        <div className="site-shell">
          <div className="section-heading split-heading">
            <div>
              <p className="section-kicker">Katkı çağrısı</p>
              <h2>Açık makale çağrıları</h2>
            </div>
            <a className="underlined-link" href="/tr/makale-cagrilari">
              Tüm çağrılar <span>→︎</span>
            </a>
          </div>
          <div className="home-call-list">
            {calls.map((call) => (
              <a
                className="home-call-row"
                href={call.url}
                key={call.title}
              >
                <span className="home-call-image">
                  {call.image && <img src={call.image} alt="" width={400} height={230} aria-hidden="true" loading="lazy" decoding="async" />}
                </span>
                <span className="home-call-deadline">
                  <small>{call.deadlineLabel}</small>
                  <CallDeadline value={call.deadline} />
                </span>
                <div className="home-call-copy">
                  <span>{call.status}</span>
                  <h3>{call.title}</h3>
                  <p>{call.summary}</p>
                </div>
                <span className="home-call-link">Çağrıyı incele <b>↗︎</b></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <IndexTicker />

      <section className="section author-cta">
        <div className="site-shell author-cta-inner">
          <div>
            <p className="section-kicker light">Yazarlar için</p>
            <h2>BRIQ’e çalışmanızı gönderin.</h2>
            <p>
              Uluslararası siyaset, ekonomi ve kültür alanlarında özgün akademik
              çalışmalar Türkçe veya İngilizce kabul edilir. Başvuru,
              değerlendirme ve yayın için ücret alınmaz.
            </p>
          </div>
          <div className="author-actions">
            <a
              className="button button-light"
              href="https://dergipark.org.tr/tr/journal/4696/submission/step/manuscript/new"
            >
              <DergiParkLogo suffix="’tan gönder" /> <span>↗︎</span>
            </a>
            <a href="/tr/yazarlar/yazim-kurallari">
              Yazım kuralları <span>→︎</span>
            </a>
            <a href="/tr/yazarlar/yayin-degerlendirme-sureci">
              Değerlendirme süreci <span>→︎</span>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
