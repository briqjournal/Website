from pathlib import Path

path = Path("app/globals.css")
text = path.read_text(encoding="utf-8")
marker = "/* Author declarations: editorial card treatment */"
if marker in text:
    raise SystemExit("Declaration design block already exists")

block = r'''

/* Author declarations: editorial card treatment */
.article-disclosure-stack .article-declaration-accordion {
  margin: 18px 0 !important;
  overflow: hidden;
  border: 1px solid rgba(24, 20, 17, .16);
  border-top: 2px solid var(--rust);
  border-radius: 10px;
  background: rgba(255, 253, 249, .5);
  box-shadow: 0 7px 24px rgba(24, 20, 17, .035);
}

.article-disclosure-stack .article-declaration-accordion:hover,
.article-disclosure-stack .article-declaration-accordion[open] {
  border-left: 1px solid rgba(24, 20, 17, .16);
  background: rgba(255, 253, 249, .72);
}

.article-disclosure-stack .article-declaration-accordion[open] {
  box-shadow: 0 16px 36px rgba(24, 20, 17, .055);
}

.article-disclosure-stack .article-declaration-accordion summary {
  min-height: 68px;
  padding: 0 58px 0 22px;
  background: linear-gradient(90deg, rgba(189, 87, 34, .035), transparent 62%);
}

.article-disclosure-stack .article-declaration-accordion summary:hover,
.article-disclosure-stack .article-declaration-accordion summary:focus-visible {
  color: var(--ink);
  background: linear-gradient(90deg, rgba(189, 87, 34, .075), rgba(255, 253, 249, .18) 72%);
}

.article-disclosure-stack .article-declaration-accordion[open] summary {
  border-bottom: 1px solid var(--line);
  background: linear-gradient(90deg, rgba(189, 87, 34, .055), rgba(255, 253, 249, .24) 72%);
}

.article-disclosure-stack .article-declaration-accordion summary > span {
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -.015em;
}

.article-disclosure-stack .article-declaration-accordion summary b {
  min-width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px;
  padding: 0;
  border: 1px solid rgba(145, 60, 25, .24);
  border-radius: 999px;
  color: var(--rust-dark);
  background: rgba(255, 253, 249, .76);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1;
  text-transform: none;
}

.article-disclosure-stack .article-declaration-accordion[open] summary b {
  color: var(--white);
  background: var(--rust-dark);
  border-color: var(--rust-dark);
}

.article-disclosure-stack .article-declaration-accordion summary::after {
  right: 21px;
}

.article-disclosure-stack .article-declaration-group {
  counter-reset: declaration;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  padding: 0 !important;
  background: var(--line);
}

.article-declaration-item {
  counter-increment: declaration;
  position: relative;
  min-width: 0;
  min-height: 138px;
  padding: 23px 24px 23px 58px;
  background: rgba(255, 253, 249, .94);
}

.article-declaration-item::before {
  content: counter(declaration, decimal-leading-zero);
  position: absolute;
  top: 24px;
  left: 21px;
  color: rgba(145, 60, 25, .68);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 12px;
  font-style: italic;
  line-height: 1;
}

.article-declaration-item h3 {
  margin: 0 0 9px;
  color: var(--rust-dark);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .105em;
  line-height: 1.35;
  text-transform: uppercase;
}

.article-declaration-item p {
  margin: 0 !important;
  color: #3f3832 !important;
  font-family: Georgia, "Times New Roman", serif !important;
  font-size: 14.5px !important;
  line-height: 1.62 !important;
}

@media (max-width: 680px) {
  .article-disclosure-stack .article-declaration-accordion {
    margin: 14px 0 !important;
    border-radius: 8px;
  }

  .article-disclosure-stack .article-declaration-accordion summary {
    min-height: 62px;
    padding: 0 52px 0 17px;
  }

  .article-disclosure-stack .article-declaration-accordion summary > span {
    font-size: 17px;
  }

  .article-disclosure-stack .article-declaration-accordion summary b {
    min-width: 27px;
    height: 27px;
    font-size: 11px;
  }

  .article-disclosure-stack .article-declaration-accordion summary::after {
    right: 17px;
  }

  .article-disclosure-stack .article-declaration-group {
    grid-template-columns: 1fr;
  }

  .article-declaration-item {
    min-height: 0;
    padding: 19px 17px 20px 50px;
  }

  .article-declaration-item::before {
    top: 21px;
    left: 17px;
  }

  .article-declaration-item p {
    font-size: 14px !important;
  }
}
'''

path.write_text(text.rstrip() + block + "\n", encoding="utf-8")
