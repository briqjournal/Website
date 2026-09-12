from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one occurrence, found {count}")
    return text.replace(old, new, 1)

# Rename the Turkish disclosure label only; do not touch the core article sections.
path = Path("app/components/ArticlePlatform.tsx")
text = path.read_text(encoding="utf-8")
text = text.replace('"Yazarın Beyanları"', '"Yazar Beyanları"')
path.write_text(text, encoding="utf-8")

# Keep rendered HTML tests aligned with the requested label.
path = Path("tests/rendered-html.test.mjs")
text = path.read_text(encoding="utf-8")
text = text.replace('/Yazarın Beyanları/', '/Yazar Beyanları/')
path.write_text(text, encoding="utf-8")

# Refine only the existing disclosure accordion styling.
path = Path("app/globals.css")
text = path.read_text(encoding="utf-8")

old = '''.article-disclosure-stack .article-accordion {
  margin: 0 !important;
  overflow: hidden;
  border: 1px solid rgba(24, 20, 17, .14);
  border-radius: 9px;
'''
new = '''.article-disclosure-stack .article-accordion {
  margin: 0 !important;
  overflow: hidden;
  border: 1px solid rgba(24, 20, 17, .14);
  border-top: 2px solid var(--rust);
  border-radius: 9px;
'''
text = replace_once(text, old, new, "generic accordion top rule")

old = '''.article-disclosure-stack .article-accordion:hover {
  border-color: rgba(145, 60, 25, .24);
  background: rgba(255, 253, 249, .66);
}

.article-disclosure-stack .article-accordion[open] {
  border-color: rgba(145, 60, 25, .24);
  background: rgba(255, 253, 249, .76);
  box-shadow: 0 12px 30px rgba(24, 20, 17, .045);
}
'''
new = '''.article-disclosure-stack .article-accordion:hover {
  border-right-color: rgba(145, 60, 25, .24);
  border-bottom-color: rgba(145, 60, 25, .24);
  border-left-color: rgba(145, 60, 25, .24);
  background: rgba(255, 253, 249, .66);
}

.article-disclosure-stack .article-accordion[open] {
  border-right-color: rgba(145, 60, 25, .24);
  border-bottom-color: rgba(145, 60, 25, .24);
  border-left-color: rgba(145, 60, 25, .24);
  background: rgba(255, 253, 249, .76);
  box-shadow: 0 12px 30px rgba(24, 20, 17, .045);
}
'''
text = replace_once(text, old, new, "preserve red top rule on hover/open")

# The declaration parent no longer needs a special top-border exception because all accordions share it.
text = text.replace('''.article-disclosure-stack .article-declaration-accordion {
  border-top: 2px solid var(--rust);
}

''', '', 1)

old = '''.article-declaration-item {
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
'''
new = '''.article-declaration-item {
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
  color: rgba(145, 60, 25, .68);
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
  background: rgba(233, 223, 210, .30);
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
  background: rgba(255, 253, 249, .86);
  font-family: Georgia, "Times New Roman", serif !important;
  font-size: 14.5px !important;
  line-height: 1.65 !important;
}

.article-declaration-item:hover h3 {
  background: rgba(233, 223, 210, .44);
}

.article-declaration-item:hover p {
  background: rgba(255, 253, 249, .98);
}
'''
text = replace_once(text, old, new, "nested declaration rows")

old = '''  .article-declaration-item {
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
'''
new = '''  .article-declaration-item {
    display: block;
    padding: 0;
  }

  .article-declaration-item::before {
    top: 16px;
    left: 16px;
  }

  .article-declaration-item h3 {
    margin: 0;
    padding: 13px 16px 12px 46px;
  }

  .article-declaration-item p {
    padding: 14px 16px 16px 46px;
    font-size: 14px !important;
  }
'''
text = replace_once(text, old, new, "mobile declaration rows")

path.write_text(text, encoding="utf-8")
