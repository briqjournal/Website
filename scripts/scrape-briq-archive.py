#!/usr/bin/env python3
"""Build a source-grounded BRIQ archive inventory from the legacy journal site."""

from __future__ import annotations

import concurrent.futures
import html
import json
import re
import sys
import time
import unicodedata
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urljoin, urlparse
from urllib.request import Request, urlopen


BASE = "https://briqjournal.com"
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "app" / "archive-data.json"
COVER_DIR = ROOT / "public" / "assets" / "archive" / "covers"

LOCAL_OVERRIDES = {
    "sanghayda-hidrojen-enerji-endustrisi-uygulamalari-ve-gelisimi": {
        "author": "Şanghay Enerji Tasarruf Komisyonu Uzman Komitesi",
        "pdf_tr_local": "/assets/archive/pdfs/cilt-3-sayi-3-sanghay-hidrojen-tr.pdf",
    },
    "1-uluslararasi-kusak-ve-yol-inisiyatifi-turkiye-sempozyumu-turkiye-dijital-ipek-yolunun-oncusu": {
        "author": "BRIQ",
        "pdf_tr_local": "/assets/archive/pdfs/cilt-3-sayi-3-turkiye-sempozyumu-tr.pdf",
    },
    "karsilikli-saygi-ve-dostluga-dayali-turk-cin-iliskilerinin-son-yarim-yuzyili-ve-gelecegi": {
        "pdf_tr_local": "/assets/archive/pdfs/cilt-3-sayi-1-turk-cin-iliskileri-tr.pdf",
    },
    "dogu-akdeniz-ve-guney-kafkasyada-basari-ve-barisin-formulu": {
        "pdf_tr_local": "/assets/archive/pdfs/cilt-1-sayi-4-dogu-akdeniz-guney-kafkasya-tr.pdf",
    },
    "turhan-selcuk-karikaturu": {
        "shared_bilingual_pdf": True,
    },
}

CROSSREF_OVERRIDES = {
    "uluslararasi-ticarette-dusuk-karbon-kurallarinda-ortaya-cikan-egilimler-ve-kusak-yol-girisimi": {
        "doi": "10.67696/2v3z8f5e",
        "orcids": ["0009-0002-0162-2234"],
    },
    "iklim-degisikligi-baglaminda-su-kitligi-ve-kuresel-gida-krizi": {
        "doi": "10.67696/6d5e3a4d",
        "orcids": ["0009-0008-8659-7165"],
    },
    "dunyanin-yeniden-duzenlenisi-bolgesel-bloklar-ve-cok-kutuplu-kuresel-yonetisimin-yukselisi": {
        "doi": "10.67696/7q2m9x4k",
        "orcids": ["0009-0000-2031-9869", "0009-0000-2315-9661"],
    },
    "islami-sistem-ve-uluslararasi-iliskilerin-demokratiklesmesi-uzerine-bir-arastirma": {
        "doi": "10.67696/6r8h4k4a",
        "orcids": ["0000-0002-7444-3432", "0009-0007-6549-432X"],
    },
    "cin-abd-iliskilerinin-gelecegi": {
        "doi": "10.67696/5y2r9u9d",
        "orcids": ["0000-0002-4840-6427"],
    },
}


def fetch(url: str, *, binary: bool = False, attempts: int = 4):
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            request = Request(
                url,
                headers={
                    "User-Agent": "BRIQ archive migration/1.0 (+https://briqjournal.com)",
                    "Accept": "*/*" if binary else "text/html,application/xhtml+xml",
                },
            )
            with urlopen(request, timeout=45) as response:
                payload = response.read()
                return payload if binary else payload.decode("utf-8", errors="replace")
        except (HTTPError, URLError, TimeoutError) as error:
            last_error = error
            if attempt + 1 < attempts:
                time.sleep(1.25 * (attempt + 1))
    raise RuntimeError(f"Could not fetch {url}: {last_error}")


def absolute(value: str | None) -> str | None:
    return urljoin(BASE, html.unescape(value)) if value else None


def clean_markup(value: str | None) -> str | None:
    if not value:
        return None
    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
    value = re.sub(r"</p\s*>", "\n", value, flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    value = unicodedata.normalize("NFC", value)
    value = re.sub(r"[ \t\r\f\v]+", " ", value)
    value = re.sub(r"\n\s*\n+", "\n", value)
    value = value.strip()
    return value or None


def slug_from_path(path: str) -> str:
    return urlparse(path).path.strip("/").split("/")[-1]


def original_image_url(value: str | None) -> str | None:
    if not value:
        return None
    value = html.unescape(value).split("?", 1)[0]
    value = re.sub(r"/styles/[^/]+/public/", "/", value)
    return absolute(value)


def page_alternate(markup: str, locale: str) -> str | None:
    match = re.search(
        rf'<link\s+rel="alternate"\s+hreflang="{re.escape(locale)}"\s+href="([^"]+)"',
        markup,
        flags=re.I,
    )
    return absolute(match.group(1)) if match else None


def field_fragment(markup: str, field_name: str) -> str | None:
    match = re.search(
        rf'<div[^>]+class="[^"]*field--name-{re.escape(field_name)}[^"]*"[^>]*>(.*?)(?=<div[^>]+class="[^"]*field--name-|</article>)',
        markup,
        flags=re.I | re.S,
    )
    return match.group(1) if match else None


def field_pdf(markup: str) -> str | None:
    fragment = field_fragment(markup, "field-ilgili-dosya")
    if not fragment:
        return None
    match = re.search(r'href="([^"]+\.pdf(?:\?[^\"]*)?)"', fragment, flags=re.I)
    return absolute(match.group(1)) if match else None


def field_text(markup: str, field_name: str) -> str | None:
    return clean_markup(field_fragment(markup, field_name))


def page_title(markup: str) -> str | None:
    match = re.search(
        r'<h1[^>]*class="[^"]*page-title[^"]*"[^>]*>.*?<span[^>]*>(.*?)</span>.*?</h1>',
        markup,
        flags=re.I | re.S,
    )
    return clean_markup(match.group(1)) if match else None


def listing(locale: str) -> dict[tuple[int, int], dict]:
    path = "/sayilar" if locale == "tr" else "/en/sayilar"
    records: dict[tuple[int, int], dict] = {}
    for page in range(3):
        markup = fetch(f"{BASE}{path}?page={page}")
        pattern = re.compile(
            r'id="sayi-gorunum-gorsel".*?'
            r'<a\s+href="([^"]+)"[^>]*>.*?'
            r'<img[^>]+src="([^"]+)".*?'
            r'id="sayi-gorunum-baslik".*?'
            r'<a\s+href="([^"]+)"[^>]*>(.*?)</a>',
            flags=re.I | re.S,
        )
        for _image_href, image_src, issue_href, label_markup in pattern.findall(markup):
            label = clean_markup(label_markup) or ""
            numbers = [int(value) for value in re.findall(r"\d+", label)]
            if len(numbers) < 2:
                continue
            key = (numbers[0], numbers[1])
            records[key] = {
                "path": html.unescape(issue_href),
                "source": absolute(issue_href),
                "cover_source": original_image_url(image_src),
                "label": label,
            }
    return records


def issue_articles(markup: str) -> list[dict]:
    header_pattern = re.compile(
        r'<h3\s+class="js-views-accordion-group-header">\s*'
        r'<div\s+id="icindekiler">\s*'
        r'<a\s+href="([^"]+)"[^>]*>(.*?)</a>\s*-\s*'
        r'<a\s+href="([^"]+)"[^>]*>(.*?)</a>\s*'
        r'</div>\s*</h3>',
        flags=re.I | re.S,
    )
    matches = list(header_pattern.finditer(markup))
    articles: list[dict] = []
    seen: set[str] = set()
    for index, match in enumerate(matches):
        article_path = html.unescape(match.group(3))
        if not article_path.startswith("/") or article_path in seen:
            continue
        seen.add(article_path)
        tail_end = matches[index + 1].start() if index + 1 < len(matches) else len(markup)
        tail = markup[match.end():tail_end]
        abstract_match = re.search(
            r'views-field-field-oz-abstract.*?<div\s+class="field-content">(.*?)(?=</div>\s*</div>\s*<div\s+class="views-field\s+views-field-nid")',
            tail,
            flags=re.I | re.S,
        )
        articles.append(
            {
                "slug": slug_from_path(article_path),
                "author": clean_markup(match.group(2)) or "BRIQ",
                "title": clean_markup(match.group(4)) or slug_from_path(article_path),
                "source": absolute(article_path),
                "abstract": clean_markup(abstract_match.group(1)) if abstract_match else None,
            }
        )
    return articles


def scrape_article(article: dict) -> dict:
    markup_tr = fetch(article["source_tr"])
    source_en = page_alternate(markup_tr, "en")
    markup_en = fetch(source_en) if source_en and source_en != article["source_tr"] else None
    citation_tr = field_text(markup_tr, "field-atif")
    citation_en = field_text(markup_en, "field-atif") if markup_en else None
    pages_match = re.search(r",\s*(\d+\s*[-–]\s*\d+)\.?\s*$", citation_tr or "")
    title_en = page_title(markup_en) if markup_en else None
    abstract_en = field_text(markup_en, "field-oz-abstract") if markup_en else None
    result = {
        **article,
        "source_en": source_en,
        "title_en": title_en,
        "abstract_en": abstract_en,
        "citation_tr": citation_tr,
        "citation_en": citation_en,
        "pages": pages_match.group(1).replace(" ", "") if pages_match else None,
        "pdf_tr_source": field_pdf(markup_tr),
        "pdf_en_source": field_pdf(markup_en) if markup_en else None,
    }
    result.update(LOCAL_OVERRIDES.get(article["slug"], {}))
    result.update(CROSSREF_OVERRIDES.get(article["slug"], {}))
    return result


def season(volume: int, issue: int) -> tuple[str, str, str]:
    end_year = 2019 + volume
    if issue == 1:
        return "Kış", "Winter", f"{end_year - 1}-{end_year}"
    labels = {2: ("Bahar", "Spring"), 3: ("Yaz", "Summer"), 4: ("Güz", "Autumn")}
    tr, en = labels[issue]
    return tr, en, str(end_year)


def cover_suffix(source: str | None) -> str:
    if not source:
        return ".jpg"
    suffix = Path(unquote(urlparse(source).path)).suffix.lower()
    return suffix if suffix in {".jpg", ".jpeg", ".png", ".webp"} else ".jpg"


def download_cover(source: str | None, destination: Path) -> bool:
    if not source:
        return False
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(fetch(source, binary=True))
    return True


def main() -> None:
    tr_listing = listing("tr")
    en_listing = listing("en")
    if len(tr_listing) != 27:
        raise RuntimeError(f"Expected 27 Turkish issues, found {len(tr_listing)}")
    print(f"Found {len(tr_listing)} issues", flush=True)

    issues: list[dict] = []
    article_jobs: list[dict] = []
    for position, key in enumerate(sorted(tr_listing, reverse=True), start=1):
        volume, issue_number = key
        tr = tr_listing[key]
        en = en_listing.get(key, {})
        markup_tr = fetch(tr["source"])
        source_en = page_alternate(markup_tr, "en") or en.get("source")
        markup_en = fetch(source_en) if source_en else ""
        season_tr, season_en, year = season(volume, issue_number)
        parsed_articles = issue_articles(markup_tr)
        issue_slug = f"cilt-{volume}-sayi-{issue_number}"
        for article in parsed_articles:
            article_jobs.append(
                {
                    "slug": article["slug"],
                    "volume": volume,
                    "issue": issue_number,
                    "season_tr": season_tr,
                    "season_en": season_en,
                    "year": year,
                    "author": article["author"],
                    "title_tr": article["title"],
                    "abstract_tr": article["abstract"],
                    "source_tr": article["source"],
                }
            )

        cover_tr_source = tr.get("cover_source")
        cover_en_source = en.get("cover_source")
        cover_tr_name = f"{issue_slug}-tr{cover_suffix(cover_tr_source)}"
        cover_en_name = f"{issue_slug}-en{cover_suffix(cover_en_source)}"
        download_cover(cover_tr_source, COVER_DIR / cover_tr_name)
        if cover_en_source:
            download_cover(cover_en_source, COVER_DIR / cover_en_name)

        issues.append(
            {
                "volume": volume,
                "issue": issue_number,
                "season_tr": season_tr,
                "season_en": season_en,
                "year": year,
                "source_tr": tr["source"],
                "source_en": source_en,
                "cover_tr": f"/assets/archive/covers/{cover_tr_name}",
                "cover_en": f"/assets/archive/covers/{cover_en_name}" if cover_en_source else f"/assets/archive/covers/{cover_tr_name}",
                "pdf_tr_source": field_pdf(markup_tr),
                "pdf_en_source": field_pdf(markup_en) if markup_en else None,
                "articles": [article["slug"] for article in parsed_articles],
            }
        )
        print(f"Issues {position}/27; queued {len(article_jobs)} publications", flush=True)

    print(f"Fetching {len(article_jobs)} publication records", flush=True)
    articles: list[dict] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
        futures = [executor.submit(scrape_article, article) for article in article_jobs]
        for position, future in enumerate(concurrent.futures.as_completed(futures), start=1):
            articles.append(future.result())
            if position % 25 == 0 or position == len(futures):
                print(f"Publications {position}/{len(futures)}", flush=True)

    order = {(article["volume"], article["issue"], article["slug"]): index for index, article in enumerate(article_jobs)}
    articles.sort(key=lambda item: order[(item["volume"], item["issue"], item["slug"])])
    OUTPUT.write_text(
        json.dumps(
            {
                "generated_from": BASE,
                "issues": issues,
                "articles": articles,
            },
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT} with {len(issues)} issues and {len(articles)} publications", flush=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(error, file=sys.stderr)
        raise
