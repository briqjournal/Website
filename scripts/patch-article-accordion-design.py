from pathlib import Path

path = Path('app/globals.css')
text = path.read_text(encoding='utf-8')
marker = '/* Author declarations: editorial card treatment */'
if marker not in text:
    raise SystemExit('Existing declaration design block not found')
text = text.split(marker, 1)[0].rstrip()

block = r'''

/* Article disclosure accordions: unified editorial treatment */
.article-disclosure-stack {
  border-top: 0;
  display: grid;
  gap: 12px;
}

.article-disclosure-stack .article-accordion {
  margin: 0 !important;
  overflow: hidden;
  border: 1px solid rgba(24, 20, 17, .14);
  border-radius: 9px;
  background: rgba(255, 253, 249, .48);
  box-shadow: 0 5px 18px rgba(24, 20, 17, .028);
  transition: border-color .18s ease, background-color .18s ease, box-shadow .18s ease;
}

.article-disclosure-stack .article-accordion:hover {
  border-color: rgba(145, 60, 25, .24);
  background: rgba(255, 253, 249, .66);
}

.article-disclosure-stack .article-accordion[open] {
  border-color: rgba(145, 60, 25, .24);
  background: rgba(255, 253, 249, .76);
  box-shadow: 0 12px 30px rgba(24, 20, 17, .045);
}

.article-disclosure-stack .article-accordion summary {
  position: relative;
  min-height: 64px;
  padding: 0 58px 0 20px;
  color: var(--ink);
  background: linear-gradient(90deg, rgba(189, 87, 34, .025), transparent 68%);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -.012em;
}

.article-disclosure-stack .article-accordion summary:hover,
.article-disclosure-stack .article-accordion summary:focus-visible {
  color: var(--ink);
  background: linear-gradient(90deg, rgba(189, 87, 34, .06), rgba(255, 253, 249, .08) 74%);
}

.article-disclosure-stack .article-accordion[open] summary {
  border-bottom: 1px solid var(--line);
  background: linear-gradient(90deg, rgba(189, 87, 34, .045), rgba(255, 253, 249, .16) 74%);
}

.article-disclosure-stack .article-accordion summary::after {
  right: 21px;
  width: 8px;
  height: 8px;
}

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

.article-disclosure-stack .article-accordion[open] summary b {
  color: var(--rust-dark);
  background: rgba(189, 87, 34, .08);
  border-color: rgba(145, 60, 25, .25);
}

.article-disclosure-stack .article-accordion .accordion-copy,
.article-disclosure-stack .article-accordion .article-figure-accordion-body {
  padding: 22px 22px 24px;
}

/* Author declarations: stacked editorial form rows */
.article-disclosure-stack .article-declaration-accordion {
  border-top: 2px solid var(--rust);
}

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
  display: grid;
  grid-template-columns: minmax(170px, 210px) minmax(0, 1fr);
  column-gap: 30px;
  align-items: start;
  min-width: 0;
  padding: 22px 24px 22px 62px;
  border-bottom: 1px solid var(--line);
  background: rgba(255, 253, 249, .72);
}

.article-declaration-item:last-child {
  border-bottom: 0;
}

.article-declaration-item::before {
  content: counter(declaration, decimal-leading-zero);
  position: absolute;
  top: 24px;
  left: 22px;
  color: rgba(145, 60, 25, .66);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 12px;
  font-style: italic;
  line-height: 1;
}

.article-declaration-item h3 {
  margin: 1px 0 0;
  color: var(--rust-dark);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .095em;
  line-height: 1.45;
  text-transform: uppercase;
}

.article-declaration-item p {
  margin: 0 !important;
  color: #3f3832 !important;
  font-family: Georgia, "Times New Roman", serif !important;
  font-size: 14.5px !important;
  line-height: 1.65 !important;
}

.article-declaration-item:hover {
  background: rgba(255, 253, 249, .96);
}

@media (max-width: 680px) {
  .article-disclosure-stack {
    gap: 9px;
  }

  .article-disclosure-stack .article-accordion {
    border-radius: 8px;
  }

  .article-disclosure-stack .article-accordion summary {
    min-height: 58px;
    padding: 0 50px 0 16px;
    font-size: 16px;
  }

  .article-disclosure-stack .article-accordion summary::after {
    right: 16px;
  }

  .article-disclosure-stack .article-accordion summary b {
    min-width: 27px;
    height: 26px;
    padding: 0 8px;
    font-size: 8px;
  }

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

  .article-declaration-item {
    display: block;
    padding: 18px 16px 19px 50px;
  }

  .article-declaration-item::before {
    top: 20px;
    left: 17px;
  }

  .article-declaration-item h3 {
    margin: 0 0 7px;
  }

  .article-declaration-item p {
    font-size: 14px !important;
  }
}
'''

path.write_text(text + block + '\n', encoding='utf-8')
