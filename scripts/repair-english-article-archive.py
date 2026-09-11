#!/usr/bin/env python3
"""Repair every English BRIQ article PDF mapping and build English full text.

The legacy briqjournal.com article page is treated as the canonical source. For
all archive article records this script discovers the English page, downloads
its exact designed PDF, verifies/render-checks it, extracts selectable text,
updates archive-data.json + the PDF manifest, and writes a site-ready English
full-text JSON map. PDFs are staged under tmp/ for upload to R2; they are not
committed to Git by this script.
"""

from __future__ import annotations

import concurrent.futures
import hashlib
import html
import json
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://briqjournal.com"
ARCHIVE_DATA = ROOT / "app" / "archive-data.json"
FULLTEXT_OUT = ROOT / "app" / "article-fulltext-en-archive.json"
MANIFEST = ROOT / "public" / "assets" / "archive" / "pdfs" / "manifest.json"
ARTICLE_PLATFORM = ROOT / "app" / "components" / "ArticlePlatform.tsx"
STAGE = ROOT / "tmp" / "english-pdf-sync"
REPORT = ROOT / "tmp" / "english-pdf-repair-report.json"
UPLOAD_LIST = ROOT / "tmp" / "english-pdf-upload.tsv"

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/152.0.0.0 Safari/537.36"
)
SAUDI_SLUG = "suudi-arabistanin-abd-ile-cin-arasinda-cok-boyutlu-kulturel-dengeleme-stratejisi"

HTML_CACHE: dict[str, str] = {}
HTML_LOCK = threading.Lock()


def run(cmd: list[str], *, capture: bool = True, timeout: int = 240) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        cmd,
        check=True,
        text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE if capture else None,
        timeout=timeout,
    )


def curl_bytes(url: str, *, referer: str | None = None, timeout: int = 240) -> bytes:
    cmd = [
        "curl", "--fail", "--location", "--compressed", "--http1.1",
        "--retry", "4", "--retry-all-errors", "--retry-delay", "2",
        "--connect-timeout", "25", "--max-time", str(timeout),
        "-A", UA,
        "-H", "Accept: application/pdf,application/xhtml+xml,text/html;q=0.9,*/*;q=0.8",
    ]
    if referer:
        cmd.extend(["-e", referer])
    cmd.append(url)
    proc = subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout + 30)
    return proc.stdout


def fetch_html(url: str) -> str:
    with HTML_LOCK:
        cached = HTML_CACHE.get(url)
    if cached is not None:
        return cached
    payload = curl_bytes(url, timeout=180)
    text = payload.decode("utf-8", errors="replace")
    with HTML_LOCK:
        HTML_CACHE[url] = text
    return text


def attrs(tag: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for name, _quote, value in re.findall(r"([\w:-]+)\s*=\s*([\"'])(.*?)\2", tag, flags=re.I | re.S):
        result[name.lower()] = html.unescape(value.strip())
    return result


def alternate_en(markup: str) -> str | None:
    for tag in re.findall(r"<link\b[^>]*>", markup, flags=re.I | re.S):
        a = attrs(tag)
        rel = a.get("rel", "").lower().split()
        if "alternate" in rel and a.get("hreflang", "").lower() == "en" and a.get("href"):
            return urljoin(BASE, a["href"])
    return None


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


def field_fragment(markup: str, field_name: str) -> str | None:
    match = re.search(
        rf'<div[^>]+class=["\'][^"\']*field--name-{re.escape(field_name)}[^"\']*["\'][^>]*>'
        rf'(.*?)(?=<div[^>]+class=["\'][^"\']*field--name-|</article>)',
        markup,
        flags=re.I | re.S,
    )
    return match.group(1) if match else None


def field_text(markup: str, field_name: str) -> str | None:
    return clean_markup(field_fragment(markup, field_name))


def field_pdf(markup: str) -> str | None:
    fragment = field_fragment(markup, "field-ilgili-dosya") or markup
    candidates: list[str] = []
    for href in re.findall(r'href\s*=\s*["\']([^"\']+\.pdf(?:\?[^"\']*)?)["\']', fragment, flags=re.I):
        candidates.append(urljoin(BASE, html.unescape(href)))
    if not candidates and fragment is not markup:
        for href in re.findall(r'href\s*=\s*["\']([^"\']+\.pdf(?:\?[^"\']*)?)["\']', markup, flags=re.I):
            candidates.append(urljoin(BASE, html.unescape(href)))
    if not candidates:
        return None
    candidates.sort(key=lambda value: ("/yazi-ici-dosyalar/" not in value, "/dergi-sayilari/" in value, len(value)))
    return candidates[0]


def page_title(markup: str) -> str | None:
    patterns = [
        r'<h1[^>]*class=["\'][^"\']*page-title[^"\']*["\'][^>]*>.*?<span[^>]*>(.*?)</span>.*?</h1>',
        r'<h1[^>]*>(.*?)</h1>',
    ]
    for pattern in patterns:
        match = re.search(pattern, markup, flags=re.I | re.S)
        if match:
            return clean_markup(match.group(1))
    return None


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def normalize_ascii(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return normalize_space(re.sub(r"[^A-Za-z0-9]+", " ", value)).lower()


def significant_title_tokens(value: str | None) -> list[str]:
    if not value:
        return []
    stop = {"the", "a", "an", "and", "or", "of", "in", "on", "to", "for", "with", "from", "between", "toward", "towards"}
    return [token for token in normalize_ascii(value).split() if len(token) >= 4 and token not in stop][:12]


def slugify(value: str) -> str:
    value = normalize_ascii(value)
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-") or "section"


def is_header_noise(line: str) -> bool:
    s = normalize_space(line)
    if not s:
        return True
    if re.fullmatch(r"[-–—]?\s*\d{1,4}\s*[-–—]?", s):
        return True
    low = s.lower()
    if low.startswith("briq") and ("volume" in low or "vol." in low or "cilt" in low or "issue" in low):
        return True
    if re.search(r"\b(volume|vol\.?|issue)\s*\d+\b", low) and "briq" in low:
        return True
    return False


def clean_pages(layout_text: str) -> list[list[str]]:
    pages = layout_text.replace("\r", "").split("\f")
    parsed = [[line.rstrip() for line in page.splitlines()] for page in pages if page.strip()]
    if not parsed:
        return []
    occurrences: Counter[str] = Counter()
    for lines in parsed:
        seen = set()
        for line in lines:
            s = normalize_space(line)
            if 3 <= len(s) <= 160:
                seen.add(s)
        occurrences.update(seen)
    recurring_threshold = max(3, (len(parsed) + 3) // 4)
    recurring = {line for line, count in occurrences.items() if count >= recurring_threshold}
    cleaned: list[list[str]] = []
    for lines in parsed:
        out: list[str] = []
        for line in lines:
            s = normalize_space(line)
            if not s:
                out.append("")
                continue
            if s in recurring or is_header_noise(s):
                continue
            out.append(line.rstrip())
        while out and not out[0].strip():
            out.pop(0)
        while out and not out[-1].strip():
            out.pop()
        cleaned.append(out)
    return cleaned


KNOWN_HEADINGS = {
    "introduction", "background", "literature review", "methodology", "method", "methods",
    "theoretical framework", "conceptual framework", "analysis", "findings", "results",
    "results and discussion", "discussion", "conclusion", "conclusions", "recommendations",
    "acknowledgements", "acknowledgments", "references", "bibliography", "works cited",
    "historical background", "research methodology", "research findings", "abstract",
}


def heading_text(block: str) -> str | None:
    compact = normalize_space(block)
    if not compact or len(compact) > 150 or "\n" in compact:
        return None
    compact_no_num = re.sub(r"^\s*(?:\d+(?:\.\d+)*|[IVXLC]+)[.)]?\s+", "", compact, flags=re.I)
    low = compact_no_num.lower().rstrip(":")
    if low in KNOWN_HEADINGS:
        return compact.rstrip(":")
    if re.match(r"^(?:\d+(?:\.\d+)*|[IVXLC]+)[.)]?\s+[A-Z]", compact) and len(compact.split()) <= 16:
        return compact.rstrip(":")
    words = compact.split()
    if 1 <= len(words) <= 12 and not re.search(r"[.!?]$", compact):
        alpha_words = [word.strip("()[]{}:;,'\"–—-") for word in words]
        alpha_words = [word for word in alpha_words if any(ch.isalpha() for ch in word)]
        if alpha_words:
            titleish = sum(1 for word in alpha_words if word[:1].isupper() or word.isupper())
            if titleish / len(alpha_words) >= 0.8 and len(compact) <= 100:
                return compact.rstrip(":")
    return None


def blocks_from_lines(lines: list[str]) -> list[str]:
    blocks: list[str] = []
    current: list[str] = []
    def flush() -> None:
        nonlocal current
        if current:
            value = "\n".join(current).strip()
            if value:
                blocks.append(value)
            current = []
    for raw in lines:
        line = raw.strip()
        if not line:
            flush()
            continue
        if re.search(r"\S\s{3,}\S", raw):
            flush()
            blocks.append(normalize_space(raw))
            continue
        if current and current[-1].endswith("-") and line[:1].islower():
            current[-1] = current[-1][:-1] + line
        else:
            current.append(line)
    flush()
    return blocks


def extract_keywords(text: str) -> list[str]:
    match = re.search(r"(?im)^\s*(?:key\s*words|keywords)\s*[:.\-–—]?\s*(.+?)\s*$", text)
    if not match:
        return []
    value = normalize_space(match.group(1))
    parts = re.split(r"\s*[;,•]\s*", value)
    return [part.strip(" .") for part in parts if 1 < len(part.strip()) < 100][:20]


def split_references(blocks: list[str]) -> tuple[list[str], list[str]]:
    for i, block in enumerate(blocks):
        h = heading_text(block)
        if h and normalize_ascii(h) in {"references", "bibliography", "works cited", "selected bibliography"}:
            return blocks[:i], blocks[i + 1 :]
    return blocks, []


def reference_items(blocks: list[str]) -> list[dict[str, str]]:
    refs: list[str] = []
    for block in blocks:
        text = normalize_space(block)
        if not text or is_header_noise(text):
            continue
        pieces = re.split(r"(?=\s*(?:\[?\d{1,3}\]?)[.)]\s+[A-Z])", text)
        pieces = [normalize_space(piece) for piece in pieces if normalize_space(piece)]
        refs.extend(pieces or [text])
    return [{"id": f"ref-{i}", "text": text} for i, text in enumerate(refs, start=1)]


def trim_front_matter(blocks: list[str]) -> list[str]:
    if not blocks:
        return blocks
    limit = min(len(blocks), max(8, len(blocks) // 3))
    for i in range(limit):
        h = heading_text(blocks[i])
        if not h:
            continue
        normalized = normalize_ascii(re.sub(r"^\d+(?:\.\d+)*[.)]?\s*", "", h))
        if normalized in {
            "introduction", "background", "literature review", "methodology", "methods",
            "theoretical framework", "conceptual framework", "historical background",
        }:
            return blocks[i:]
    for i, block in enumerate(blocks[:limit]):
        if re.match(r"(?i)^\s*(?:key\s*words|keywords)\b", normalize_space(block)):
            return blocks[i + 1 :]
    return blocks


def sections_from_blocks(blocks: list[str]) -> list[dict[str, Any]]:
    blocks = trim_front_matter(blocks)
    sections: list[dict[str, Any]] = []
    current_title = "Full Text"
    current_id = "full-text"
    paragraphs: list[str] = []
    used_ids: Counter[str] = Counter()
    def flush() -> None:
        nonlocal paragraphs, current_title, current_id
        cleaned = [normalize_space(p) for p in paragraphs if normalize_space(p)]
        if cleaned:
            base = current_id or "section"
            used_ids[base] += 1
            sid = base if used_ids[base] == 1 else f"{base}-{used_ids[base]}"
            sections.append({"id": sid, "title": current_title, "paragraphs": cleaned})
        paragraphs = []
    for block in blocks:
        h = heading_text(block)
        if h and normalize_ascii(h) not in {"abstract", "keywords", "key words"}:
            flush()
            current_title = h
            current_id = slugify(h)
        else:
            paragraphs.append(block)
    flush()
    if not sections and blocks:
        text = [normalize_space(block) for block in blocks if normalize_space(block)]
        if text:
            sections = [{"id": "full-text", "title": "Full Text", "paragraphs": text}]
    return sections


def build_fulltext(layout_text: str) -> dict[str, Any]:
    pages = clean_pages(layout_text)
    flattened: list[str] = []
    for page in pages:
        flattened.extend(page)
        flattened.append("")
    blocks = blocks_from_lines(flattened)
    body_blocks, ref_blocks = split_references(blocks)
    return {
        "sections": sections_from_blocks(body_blocks),
        "keywords": extract_keywords("\n".join(flattened)),
        "footnotes": [],
        "references": reference_items(ref_blocks),
        "acknowledgements": "",
        "figures": [],
    }


def english_score(text: str) -> tuple[int, int]:
    words = re.findall(r"[A-Za-zÀ-ÿ]+", text.lower())
    counts = Counter(words)
    en = sum(counts[w] for w in ("the", "and", "of", "to", "in", "is", "for", "that", "with", "as", "this", "from"))
    tr = sum(counts[w] for w in ("ve", "bir", "bu", "ile", "için", "olarak", "olan", "da", "de", "çin", "türkiye", "gibi"))
    return en, tr


def validate_title(text: str, title: str | None) -> bool:
    tokens = significant_title_tokens(title)
    if len(tokens) < 2:
        return True
    normalized = normalize_ascii(text[:12000])
    hits = sum(1 for token in tokens if token in normalized)
    return hits >= min(3, max(2, len(tokens) // 3))


def pdf_info(path: Path) -> dict[str, Any]:
    output = run(["pdfinfo", str(path)]).stdout
    pages_match = re.search(r"^Pages:\s+(\d+)", output, flags=re.M)
    size_match = re.search(r"^Page size:\s+(.+)$", output, flags=re.M)
    if not pages_match:
        raise RuntimeError("pdfinfo did not report a page count")
    return {"pages": int(pages_match.group(1)), "page_size": size_match.group(1).strip() if size_match else None}


def download_and_extract(job: dict[str, Any]) -> dict[str, Any]:
    slug = job["slug"]
    destination = STAGE / f"{slug}-en.pdf"
    destination.parent.mkdir(parents=True, exist_ok=True)
    payload = curl_bytes(job["pdf_en_source"], referer=job["source_en"], timeout=300)
    if len(payload) < 10_000 or not payload.startswith(b"%PDF-"):
        raise RuntimeError(f"{slug}: downloaded response is not a valid PDF ({len(payload)} bytes)")
    destination.write_bytes(payload)
    info = pdf_info(destination)
    if info["pages"] < 1:
        raise RuntimeError(f"{slug}: PDF has no pages")
    with tempfile.TemporaryDirectory(prefix="briq-render-") as temp_dir:
        preview_prefix = Path(temp_dir) / "page"
        run(["pdftoppm", "-f", "1", "-singlefile", "-png", "-r", "72", str(destination), str(preview_prefix)], timeout=180)
        preview = preview_prefix.with_suffix(".png")
        if not preview.is_file() or preview.stat().st_size < 1000:
            raise RuntimeError(f"{slug}: first-page render verification failed")
    text_path = destination.with_suffix(".txt")
    proc = subprocess.run(["pdftotext", "-layout", str(destination), str(text_path)], text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=240)
    if proc.returncode != 0:
        raise RuntimeError(f"{slug}: pdftotext failed: {proc.stderr[-500:]}")
    layout_text = text_path.read_text(encoding="utf-8", errors="replace")
    text_path.unlink(missing_ok=True)
    normalized_text = normalize_space(layout_text)
    if len(normalized_text) < 80:
        raise RuntimeError(f"{slug}: PDF contains too little selectable text ({len(normalized_text)} chars)")
    en_score, tr_score = english_score(normalized_text[:50000])
    if len(normalized_text) > 1000 and en_score < 8 and tr_score > en_score * 1.4:
        raise RuntimeError(f"{slug}: extracted text appears non-English (en={en_score}, tr={tr_score})")
    if not validate_title(normalized_text, job.get("title_en")):
        raise RuntimeError(f"{slug}: English page title could not be matched to downloaded PDF text")
    fulltext = build_fulltext(layout_text)
    if not fulltext["sections"]:
        raise RuntimeError(f"{slug}: no full-text sections could be extracted")
    digest = hashlib.sha256(payload).hexdigest()
    local = f"/assets/archive/pdfs/articles/{slug}-en.pdf"
    return {
        **job,
        "local": local,
        "bytes": len(payload),
        "sha256": digest,
        "pages": info["pages"],
        "page_size": info["page_size"],
        "text_chars": len(normalized_text),
        "section_count": len(fulltext["sections"]),
        "reference_count": len(fulltext["references"]),
        "fulltext": fulltext,
        "stage": str(destination),
    }


def discover_article(article: dict[str, Any]) -> dict[str, Any]:
    slug = article["slug"]
    source_tr = article.get("source_tr")
    source_en = article.get("source_en")
    if not source_en or source_en == source_tr:
        if not source_tr:
            raise RuntimeError(f"{slug}: missing Turkish source page, cannot discover English alternate")
        source_en = alternate_en(fetch_html(source_tr))
    if not source_en:
        raise RuntimeError(f"{slug}: English article page could not be discovered")
    try:
        en_markup = fetch_html(source_en)
    except Exception:
        if source_tr:
            alternate = alternate_en(fetch_html(source_tr))
            if alternate and alternate != source_en:
                source_en = alternate
                en_markup = fetch_html(source_en)
            else:
                raise
        else:
            raise
    pdf_source = field_pdf(en_markup)
    if not pdf_source:
        existing = article.get("pdf_en_source")
        if existing and existing != article.get("pdf_tr_source"):
            pdf_source = existing
    if not pdf_source:
        raise RuntimeError(f"{slug}: English PDF link not found on {source_en}")
    return {
        "slug": slug,
        "source_en": source_en,
        "pdf_en_source": pdf_source,
        "title_en": page_title(en_markup) or article.get("title_en"),
        "abstract_en": field_text(en_markup, "field-oz-abstract") or article.get("abstract_en"),
    }


def patch_article_platform() -> bool:
    text = ARTICLE_PLATFORM.read_text(encoding="utf-8")
    original = text
    import_line = 'import archiveEnglishFullTextJson from "../article-fulltext-en-archive.json";\n'
    if import_line not in text:
        needle = 'import fullTextJson from "../article-fulltext-current.json";\n'
        if needle not in text:
            raise RuntimeError("ArticlePlatform import anchor not found")
        text = text.replace(needle, needle + import_line, 1)
    const_line = 'const archiveEnglishFullText = archiveEnglishFullTextJson as Record<string, LocalizedFullText>;\n'
    if const_line not in text:
        needle = 'const currentFullText = fullTextJson as Record<string, CurrentFullTextRecord>;\n'
        if needle not in text:
            raise RuntimeError("ArticlePlatform currentFullText anchor not found")
        text = text.replace(needle, needle + const_line, 1)
    old = '''  const fullRecord = currentFullText[article.slug];
  const storedFullText = fullRecord?.[locale];
  const fullText = locale === "en" && article.slug === SAUDI_CULTURAL_HEDGING_SLUG
    ? (saudiEnglishFullTextJson as LocalizedFullText)
    : storedFullText;
'''
    new = '''  const fullRecord = currentFullText[article.slug];
  const storedFullText = fullRecord?.[locale];
  const archivedEnglishFullText = archiveEnglishFullText[article.slug];
  const fullText = locale === "en"
    ? (article.slug === SAUDI_CULTURAL_HEDGING_SLUG
        ? (saudiEnglishFullTextJson as LocalizedFullText)
        : (article.volume === 7 && article.issue === 3
            ? (storedFullText || archivedEnglishFullText)
            : (archivedEnglishFullText || storedFullText)))
    : storedFullText;
'''
    if old in text:
        text = text.replace(old, new, 1)
    elif "const archivedEnglishFullText = archiveEnglishFullText[article.slug];" not in text:
        raise RuntimeError("ArticlePlatform full-text selection anchor not found")
    if text != original:
        ARTICLE_PLATFORM.write_text(text, encoding="utf-8")
        return True
    return False


def update_manifest(results: list[dict[str, Any]]) -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    by_local = {entry.get("local"): entry for entry in manifest.get("files", []) if entry.get("local")}
    for item in results:
        by_local[item["local"]] = {
            "source": item["pdf_en_source"],
            "local": item["local"],
            "bytes": item["bytes"],
            "sha256": item["sha256"],
            "status": "downloaded-exact-designed-english-article-pdf",
            "note": "Exact designed English article PDF archived directly from the legacy BRIQ English article page.",
        }
    files = sorted(by_local.values(), key=lambda entry: entry.get("local", ""))
    manifest["files"] = files
    manifest["unique_files"] = len(files)
    manifest["total_bytes"] = sum(int(entry.get("bytes") or 0) for entry in files)
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    for binary in ("curl", "pdfinfo", "pdftotext", "pdftoppm"):
        if not shutil.which(binary):
            raise RuntimeError(f"Required binary is missing: {binary}")
    STAGE.mkdir(parents=True, exist_ok=True)
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    for old in STAGE.glob("*-en.pdf"):
        old.unlink()
    data = json.loads(ARCHIVE_DATA.read_text(encoding="utf-8"))
    articles = data.get("articles", [])
    print(f"Discovering English sources for {len(articles)} article records", flush=True)
    discovered: list[dict[str, Any]] = []
    discovery_failures: list[dict[str, str]] = []
    for index, article in enumerate(articles, start=1):
        try:
            discovered.append(discover_article(article))
        except Exception as error:
            discovery_failures.append({"slug": article.get("slug", "?"), "error": str(error)})
        if index % 25 == 0 or index == len(articles):
            print(f"Discovery {index}/{len(articles)}; ok={len(discovered)} failures={len(discovery_failures)}", flush=True)
    if discovery_failures:
        REPORT.write_text(json.dumps({"phase": "discovery", "total_articles": len(articles), "discovered": len(discovered), "failures": discovery_failures}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        for failure in discovery_failures:
            print(f"DISCOVERY FAILURE {failure['slug']}: {failure['error']}")
        raise RuntimeError(f"English source discovery failed for {len(discovery_failures)} articles")
    by_slug = {item["slug"]: item for item in discovered}
    jobs = [by_slug[article["slug"]] for article in articles]
    print(f"Downloading, rendering and extracting {len(jobs)} English article PDFs", flush=True)
    results: list[dict[str, Any]] = []
    extract_failures: list[dict[str, str]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_map = {executor.submit(download_and_extract, job): job for job in jobs}
        for index, future in enumerate(concurrent.futures.as_completed(future_map), start=1):
            job = future_map[future]
            try:
                results.append(future.result())
            except Exception as error:
                extract_failures.append({"slug": job["slug"], "error": str(error)})
            if index % 10 == 0 or index == len(jobs):
                total_mb = sum(item["bytes"] for item in results) / (1024 * 1024)
                print(f"PDF/text {index}/{len(jobs)}; ok={len(results)} failures={len(extract_failures)}; {total_mb:.1f} MiB staged", flush=True)
    results.sort(key=lambda item: item["slug"])
    if extract_failures:
        REPORT.write_text(json.dumps({"phase": "download-extract", "total_articles": len(articles), "succeeded": len(results), "failures": extract_failures, "succeeded_records": [{k: item[k] for k in ("slug", "source_en", "pdf_en_source", "bytes", "sha256", "pages", "text_chars")} for item in results]}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        for failure in extract_failures:
            print(f"EXTRACTION FAILURE {failure['slug']}: {failure['error']}")
        raise RuntimeError(f"English PDF/text repair failed for {len(extract_failures)} articles")
    result_by_slug = {item["slug"]: item for item in results}
    fulltext: dict[str, Any] = {}
    for article in articles:
        item = result_by_slug[article["slug"]]
        article["source_en"] = item["source_en"]
        article["pdf_en_source"] = item["pdf_en_source"]
        article["pdf_en_local"] = item["local"]
        if item.get("title_en"):
            article["title_en"] = item["title_en"]
        if item.get("abstract_en"):
            article["abstract_en"] = item["abstract_en"]
        if article.get("pdf_tr_source") != item["pdf_en_source"]:
            article["shared_bilingual_pdf"] = False
        fulltext[article["slug"]] = item["fulltext"]
    ARCHIVE_DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    FULLTEXT_OUT.write_text(json.dumps(fulltext, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    update_manifest(results)
    platform_changed = patch_article_platform()
    with UPLOAD_LIST.open("w", encoding="utf-8") as handle:
        for item in results:
            handle.write(f"{item['stage']}\t{item['local'].lstrip('/')}\t{item['bytes']}\t{item['sha256']}\n")
    report = {
        "phase": "complete",
        "total_articles": len(articles),
        "english_pages": len(discovered),
        "english_pdfs": len(results),
        "fulltexts": len(fulltext),
        "total_pdf_bytes": sum(item["bytes"] for item in results),
        "article_platform_patched": platform_changed,
        "records": [{k: item[k] for k in ("slug", "source_en", "pdf_en_source", "local", "bytes", "sha256", "pages", "text_chars", "section_count", "reference_count")} for item in results],
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Prepared {len(results)} exact English PDFs and {len(fulltext)} full-text records; {report['total_pdf_bytes'] / (1024 * 1024):.1f} MiB total.", flush=True)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as error:
        stderr = error.stderr.decode(errors="replace") if isinstance(error.stderr, bytes) else (error.stderr or "")
        stdout = error.stdout.decode(errors="replace") if isinstance(error.stdout, bytes) else (error.stdout or "")
        print(f"Command failed: {error.cmd}\nSTDOUT:\n{stdout[-2000:]}\nSTDERR:\n{stderr[-2000:]}", file=sys.stderr)
        raise
