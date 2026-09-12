from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one occurrence, found {count}")
    return text.replace(old, new, 1)

# 1) Article platform: rename declarations and make Abstract / Keywords default-open accordions.
path = Path("app/components/ArticlePlatform.tsx")
text = path.read_text(encoding="utf-8")
text = text.replace('"Yazarın Beyanları"', '"Yazar Beyanları"')

old = '''          <section className="article-abstract" id={locale === "tr" ? "oz" : "abstract"}>
            <h2>{locale === "tr" ? "Öz" : "Abstract"}</h2>
            {abstract.length ? abstract.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>{locale === "tr" ? "Kaynak arşivinde bu içerik için ayrı bir özet metni bulunmamaktadır." : "The source archive does not contain a separate abstract for this contribution."}</p>}
          </section>

          {keywords.length ? <section className="article-keywords" id={locale === "tr" ? "anahtar-kelimeler" : "keywords"}><h2>{locale === "tr" ? "Anahtar kelimeler" : "Keywords"}</h2><div>{keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div></section> : null}

          {fullText?.sections.length ? <ArticleRichText sections={fullText.sections} references={displayReferences} notes={fullText.footnotes} locale={locale} /> : (
            <section className="legacy-fulltext-note"><h2>{locale === "tr" ? "Tam Metin" : "Full Text"}</h2><p>{locale === "tr" ? "Bu arşiv kaydının tam metni dijitalleştirme sırasındadır. Doğrulanmış makale dosyasına üstteki PDF düğmesinden erişebilirsiniz." : "The full text for this archival record is being digitised. Use the PDF button above to access the verified article file."}</p></section>
          )}
'''
new = '''          <div className="article-core-stack">
            <details className="article-accordion article-core-accordion article-abstract" id={locale === "tr" ? "oz" : "abstract"} open>
              <summary><span>{locale === "tr" ? "Öz" : "Abstract"}</span></summary>
              <div className="accordion-copy article-core-copy">
                {abstract.length ? abstract.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>{locale === "tr" ? "Kaynak arşivinde bu içerik için ayrı bir özet metni bulunmamaktadır." : "The source archive does not contain a separate abstract for this contribution."}</p>}
              </div>
            </details>

            {keywords.length ? <details className="article-accordion article-core-accordion article-keywords" id={locale === "tr" ? "anahtar-kelimeler" : "keywords"} open><summary><span>{locale === "tr" ? "Anahtar Kelimeler" : "Keywords"}</span></summary><div className="accordion-copy article-core-copy"><div className="article-keyword-list">{keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div></div></details> : null}

            {fullText?.sections.length ? <ArticleRichText sections={fullText.sections} references={displayReferences} notes={fullText.footnotes} locale={locale} /> : (
              <details className="article-accordion article-core-accordion legacy-fulltext-note" id={locale === "tr" ? "tam-metin" : "full-text-body"} open><summary><span>{locale === "tr" ? "Tam Metin" : "Full Text"}</span></summary><div className="accordion-copy article-core-copy"><p>{locale === "tr" ? "Bu arşiv kaydının tam metni dijitalleştirme sırasındadır. Doğrulanmış makale dosyasına üstteki PDF düğmesinden erişebilirsiniz." : "The full text for this archival record is being digitised. Use the PDF button above to access the verified article file."}</p></div></details>
            )}
          </div>
'''
text = replace_once(text, old, new, "article core block")
path.write_text(text, encoding="utf-8")

# 2) Full text itself becomes a default-open disclosure.
path = Path("app/components/ArticleRichText.tsx")
text = path.read_text(encoding="utf-8")
old = '''  return (
    <section className="article-fulltext" id={locale === "tr" ? "tam-metin" : "full-text-body"}>
      <h2>{locale === "tr" ? "Tam Metin" : "Full Text"}</h2>
      <div className="article-fulltext-sections">
'''
new = '''  return (
    <details className="article-accordion article-core-accordion article-fulltext" id={locale === "tr" ? "tam-metin" : "full-text-body"} open>
      <summary><span>{locale === "tr" ? "Tam Metin" : "Full Text"}</span></summary>
      <div className="accordion-copy article-core-copy article-fulltext-copy">
        <div className="article-fulltext-sections">
'''
text = replace_once(text, old, new, "full-text opening")
old = '''      </div>
    </section>
  );
}
'''
new = '''        </div>
      </div>
    </details>
  );
}
'''
text = replace_once(text, old, new, "full-text closing")
path.write_text(text, encoding="utf-8")

# 3) Replace the article accordion design block with a unified publisher-style system.
path = Path("app/globals.css")
text = path.read_text(encoding="utf-8")
marker = "/* Article disclosure accordions: unified editorial treatment */"
if marker not in text:
    raise SystemExit("accordion design marker not found")
text = text.split(marker, 1)[0].rstrip()
block = r'''

/* Article accordions: unified publisher-style treatment */
.article-core-stack,
.article-disclosure-stack {
  border-top: 0;
  display: grid;
  gap: 12px;
}

.article-core-stack {
  margin-bottom: 12px;
}

.article-core-stack .article-accordion,
.article-disclosure-stack .article-accordion {
  margin: 0 !important;
  overflow: hidden;
  border: 1px solid rgba(24, 20, 17, .14);
  border-top: 2px solid var(--rust);
  border-bottom: 1px solid var(--line);
  border-radius: 9px;
  background: rgba(255, 253, 249, .5);
  box-shadow: 0 5px 18px rgba(24, 20, 17, .028);
  transition: border-color .18s ease, background-color .18s ease, box-shadow .18s ease;
}

.article-core-stack .article-accordion:hover,
.article-disclosure-stack .article-accordion:hover {
  border-right-color: rgba(145, 60, 25, .24);
  border-bottom-color: rgba(145, 60, 25, .2);
  border-left-color: rgba(145, 60, 25, .24);
  background: rgba(255, 253, 249, .68);
}

.article-core-stack .article-accordion[open],
.article-disclosure-stack .article-accordion[open] {
  border-right-color: rgba(145, 60, 25, .24);
  border-bottom-color: rgba(145, 60, 25, .2);
  border-left-color: rgba(145, 60, 25, .24);
  background: rgba(255, 253, 249, .78);
  box-shadow: 0 12px 30px rgba(24, 20, 17, .045);
}

.article-core-stack .article-accordion summary,
.article-disclosure-stack .article-accordion summary {
  position: relative;
  min-height: 64px;
  padding: 0 58px 0 20px;
  color: var(--ink);
  background: linear-gradient(90deg, rgba(189, 87, 34, .028), transparent 68%);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -.012em;
}

.article-core-stack .article-accordion summary:hover,
.article-core-stack .article-accordion summary:focus-visible,
.article-disclosure-stack .article-accordion summary:hover,
.article-disclosure-stack .article-accordion summary:focus-visible {
  color: var(--ink);
  background: linear-gradient(90deg, rgba(189, 87, 34, .065), rgba(255, 253, 249, .08) 74%);
}

.article-core-stack .article-accordion[open] summary,
.article-disclosure-stack .article-accordion[open] summary {
  border-bottom: 1px solid var(--line);
  background: linear-gradient(90deg, rgba(189, 87, 34, .048), rgba(255, 253, 249, .16) 74%);
}

.article-core-stack .article-accordion summary > span,
.article-disclosure-stack .article-accordion summary > span {
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  letter-spacing: inherit;
}

.article-core-stack .article-accordion summary::after,
.article-disclosure-stack .article-accordion summary::after {
  right: 21px;
  width: 8px;
  height: 8px;
}

.article-core-stack .article-accordion summary b,
.article-disclosure-stack .article-accordion summary b {
  min-width: 30px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px;
  padding: 0 9px;
  border: 1px solid rgba(145, 60, 25, .19);
  border-radius: 999px;
  color: var(--rust-dark);
  background: rgba(255, 253, 249, .72);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .07em;
  line-height: 1;
  text-transform: uppercase;
}

.article-core-stack .article-accordion[open] summary b,
.article-disclosure-stack .article-accordion[open] summary b {
  color: var(--rust-dark);
  background: rgba(189, 87, 34, .08);
  border-color: rgba(145, 60, 25, .25);
}

.article-core-stack .article-accordion .accordion-copy,
.article-disclosure-stack .article-accordion .accordion-copy,
.article-disclosure-stack .article-accordion .article-figure-accordion-body {
  padding: 22px 22px 24px;
}

/* Core reading sections are open by default but remain collapsible. */
.article-core-stack .article-abstract + .article-keywords,
.article-core-stack .article-keywords + .article-fulltext,
.article-core-stack .article-abstract + .article-fulltext,
.article-core-stack .article-keywords + .legacy-fulltext-note,
.article-core-stack .article-abstract + .legacy-fulltext-note {
  padding-top: 0;
  border-top: 2px solid var(--rust);
}

.article-core-stack .article-core-copy > :first-child {
  margin-top: 0;
}

.article-core-stack .article-core-copy > :last-child {
  margin-bottom: 0;
}

.article-keywords .article-keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin: 0;
}

.article-keywords .article-keyword-list span {
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--white);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .02em;
}

.article-fulltext-sections {
  margin-top: 0;
}

/* Author declarations: nested form-like rows inside the parent disclosure. */
.article-disclosure-stack .article-declaration-accordion summary > span {
  font-size: 19px;
  letter-spacing: -.015em;
}

.article-disclosure-stack .article-declaration-accordion summary b {
  min-width: 30px;
  width: 30px;
  padding: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

.article-disclosure-stack .article-declaration-group {
  counter-reset: declaration;
  display: block;
  padding: 0 !important;
  background: transparent;
}

.article-declaration-item {
  counter-increment: declaration;
  position: relative;
  display: block;
  min-width: 0;
  padding: 0;
  border-bottom: 1px solid var(--line);
  background: rgba(255, 253, 249, .72);
}

.article-declaration-item:last-child {
  border-bottom: 0;
}

.article-declaration-item::before {
  content: counter(declaration, decimal-leading-zero);
  position: absolute;
  z-index: 1;
  top: 17px;
  left: 21px;
  color: rgba(145, 60, 25, .7);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 12px;
  font-style: italic;
  line-height: 1;
}

.article-declaration-item h3 {
  margin: 0;
  padding: 14px 22px 13px 54px;
  border-bottom: 1px solid rgba(24, 20, 17, .09);
  color: var(--rust-dark);
  background: rgba(233, 223, 210, .32);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .095em;
  line-height: 1.45;
  text-transform: uppercase;
}

.article-declaration-item p {
  margin: 0 !important;
  padding: 16px 22px 18px 54px;
  color: #3f3832 !important;
  background: rgba(255, 253, 249, .84);
  font-family: Georgia, "Times New Roman", serif !important;
  font-size: 14.5px !important;
  line-height: 1.65 !important;
}

.article-declaration-item:hover h3 {
  background: rgba(233, 223, 210, .46);
}

.article-declaration-item:hover p {
  background: rgba(255, 253, 249, .98);
}

@media (max-width: 680px) {
  .article-core-stack,
  .article-disclosure-stack {
    gap: 9px;
  }

  .article-core-stack .article-accordion,
  .article-disclosure-stack .article-accordion {
    border-radius: 8px;
  }

  .article-core-stack .article-accordion summary,
  .article-disclosure-stack .article-accordion summary {
    min-height: 58px;
    padding: 0 50px 0 16px;
    font-size: 16px;
  }

  .article-core-stack .article-accordion summary::after,
  .article-disclosure-stack .article-accordion summary::after {
    right: 16px;
  }

  .article-core-stack .article-accordion summary b,
  .article-disclosure-stack .article-accordion summary b {
    min-width: 27px;
    height: 26px;
    padding: 0 8px;
    font-size: 8px;
  }

  .article-core-stack .article-accordion .accordion-copy,
  .article-disclosure-stack .article-accordion .accordion-copy,
  .article-disclosure-stack .article-accordion .article-figure-accordion-body {
    padding: 18px 16px 20px;
  }

  .article-disclosure-stack .article-declaration-accordion summary > span {
    font-size: 17px;
  }

  .article-disclosure-stack .article-declaration-accordion summary b {
    width: 27px;
    padding: 0;
    font-size: 11px;
  }

  .article-declaration-item::before {
    top: 16px;
    left: 16px;
  }

  .article-declaration-item h3 {
    padding: 13px 16px 12px 46px;
  }

  .article-declaration-item p {
    padding: 14px 16px 17px 46px;
    font-size: 14px !important;
  }
}
'''
path.write_text(text + block + "\n", encoding="utf-8")

# 4) Update rendered-HTML tests for the new disclosure hierarchy.
path = Path("tests/rendered-html.test.mjs")
text = path.read_text(encoding="utf-8")
text = text.replace('assert.match(doiHtml, /Yazarın Beyanları/);', 'assert.match(doiHtml, /Yazar Beyanları/);')
text = text.replace('label: locale === "tr" ? "Yazarın Beyanları"', 'label: locale === "tr" ? "Yazar Beyanları"')

old = '''    const keywordSection = html.match(/<section class="article-keywords"[\\s\\S]*?<\\/section>/)?.[0] || "";
    const keywords = [...keywordSection.matchAll(/<span>([^<]+)<\\/span>/g)].map((match) => match[1]);
'''
new = '''    const keywordSection = html.match(/<div class="article-keyword-list">[\\s\\S]*?<\\/div>/)?.[0] || "";
    const keywords = [...keywordSection.matchAll(/<span>([^<]+)<\\/span>/g)].map((match) => match[1]);
'''
text = replace_once(text, old, new, "keyword test")

old = '''  assert.match(trArticle, /<h2>Öz<\\/h2>/);
  assert.doesNotMatch(trArticle, /<h2>Özet<\\/h2>/);
  assert.doesNotMatch(trArticle, /<p class="section-kicker">Öz<\\/p>/);
  assert.equal((enArticle.match(/<h2>Abstract<\\/h2>/g) || []).length, 1);
  assert.match(trArticle, /<section class="article-fulltext" id="tam-metin"><h2>Tam Metin<\\/h2>/);
  assert.match(enArticle, /<section class="article-fulltext" id="full-text-body"><h2>Full Text<\\/h2>/);
'''
new = '''  assert.match(trArticle, /<details class="article-accordion article-core-accordion article-abstract" id="oz" open=""><summary><span>Öz<\\/span><\\/summary>/);
  assert.doesNotMatch(trArticle, /<h2>Özet<\\/h2>/);
  assert.doesNotMatch(trArticle, /<p class="section-kicker">Öz<\\/p>/);
  assert.match(enArticle, /<details class="article-accordion article-core-accordion article-abstract" id="abstract" open=""><summary><span>Abstract<\\/span><\\/summary>/);
  assert.match(trArticle, /<details class="article-accordion article-core-accordion article-fulltext" id="tam-metin" open=""><summary><span>Tam Metin<\\/span><\\/summary>/);
  assert.match(enArticle, /<details class="article-accordion article-core-accordion article-fulltext" id="full-text-body" open=""><summary><span>Full Text<\\/span><\\/summary>/);
  assert.match(trArticle, /<details class="article-accordion article-core-accordion article-keywords" id="anahtar-kelimeler" open=""><summary><span>Anahtar Kelimeler<\\/span><\\/summary>/);
'''
text = replace_once(text, old, new, "core hierarchy test")
path.write_text(text, encoding="utf-8")
