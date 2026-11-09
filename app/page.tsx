import type { Metadata } from "next";
import styles from "./language-gateway.module.css";

/**
 * An invariant, crawlable x-default landing page.
 *
 * The English and Turkish homepages keep their own canonical URLs; the root
 * must not vary by visitor IP or send Googlebot a country-dependent redirect.
 */
export const metadata: Metadata = {
  title: "BRIQ | Dil Seçimi · Language Selection",
  description:
    "BRIQ Journal — Türkçe veya İngilizce sürümü seçin. Choose the Turkish or English edition of BRIQ.",
  alternates: {
    canonical: "/",
    languages: { "tr-TR": "/tr/", "en-US": "/en/", "x-default": "/" },
  },
};

export default function LocaleGateway() {
  return (
    <main className={styles.gateway}>
      <section className={styles.panel} aria-labelledby="gateway-title">
        <header className={styles.header}>
          <span className={styles.wordmark}>BRIQ</span>
          <span className={styles.rule} aria-hidden="true" />
          <span className={styles.masthead}>Belt &amp; Road Initiative Quarterly</span>
        </header>

        <div className={styles.body}>
          <p className={styles.kicker}>HAKEMLİ · AÇIK ERİŞİM · PEER-REVIEWED · OPEN ACCESS</p>
          <h1 className={styles.heading} id="gateway-title">
            Dil seçimi
            <span lang="en">Choose your language</span>
          </h1>
          <p className={styles.description}>
            BRIQ Dergisi&apos;nin Türkçe veya İngilizce sürümüne geçebilirsiniz.
            <span lang="en">Select your preferred edition of BRIQ Journal.</span>
          </p>

          <nav className={styles.choices} aria-label="Dil seçimi / Language selection">
            <a className={styles.choice} href="/tr/" lang="tr" hrefLang="tr">
              <span className={styles.choiceEyebrow}>TÜRKÇE YAYIN</span>
              <strong>Türkçe</strong>
              <span className={styles.choiceLabel}>Dergiye devam et <span aria-hidden="true">↗</span></span>
            </a>
            <a className={styles.choice} href="/en/" lang="en" hrefLang="en">
              <span className={styles.choiceEyebrow}>ENGLISH EDITION</span>
              <strong>English</strong>
              <span className={styles.choiceLabel}>Enter the journal <span aria-hidden="true">↗</span></span>
            </a>
          </nav>
        </div>

        <footer className={styles.footer}>
          <span>ISSN 2687-5896 · E-ISSN 2718-0581</span>
          <span>BRIQ — Bilimsel dergi / Scholarly journal</span>
        </footer>
      </section>
    </main>
  );
}
