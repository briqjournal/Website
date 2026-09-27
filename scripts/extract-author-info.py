#!/usr/bin/env python3
"""Extract author-block candidates (affiliation, bio, email, ORCID) from BRIQ article PDFs.

Canonical evidence source is the official BRIQ PDF (first page author block).
This tool does NOT edit canonical sources; it reports candidates with provenance
for human verification before any `app/authors.ts` / `metadata.json` change.

Usage:
  python3 scripts/extract-author-info.py <slug> [--locale both|tr|en]
  python3 scripts/extract-author-info.py --all --limit 5

Extractor: PyMuPDF first (fast, preserves Turkish chars), fallback to
`pdftotext -layout` (already in CI via poppler-utils).
Download headers reuse `scripts/localize-pdf-archive.py` convention.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import time
import unicodedata
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CACHE_DIR = ROOT / ".audit" / "author-info-pdfs"
OUT_DIR = ROOT / ".audit" / "author-info"

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
ORCID_RE = re.compile(r"\b\d{4}-\d{4}-\d{4}-\d{3}[\dX]\b")
EMAIL_LABEL_RE = re.compile(r"(?:E-?mail|E-?posta)\s*:\s*([A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})", re.I)
STAR_BIO_RE = re.compile(r"\*\s*(?P<bio>.+?)(?P<mail>(?:E-?mail|E-?posta)\s*:\s*[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})", re.I | re.S)

TITLE_PREFIXES = [
    r"Assoc\.?\s+Prof\.?\s+Dr\.?\s*",
    r"Asst\.?\s+Prof\.?\s+Dr\.?\s*",
    r"Asst\.?\s+Prof\.?\s*",
    r"Doç\.?\s+Dr\.?\s*",
    r"Dr\.?\s+Öğr\.?\s+Üyesi\s*",
    r"Prof\.?\s+Dr\.?\s*",
    r"Prof\s+Dr\.?\s*",
    r"Prof\.?\s*",
    r"Dr\.?\s*",
]


def strip_title(name: str) -> str:
    out = name.strip()
    for pat in TITLE_PREFIXES:
        out = re.sub(r"^" + pat, "", out, flags=re.I).strip()
    return out


def norm_name(s: str) -> str:
    s = unicodedata.normalize("NFC", s or "")
    return s.lower().replace("i\u0307", "i")


def norm_space(s: str) -> str:
    s = unicodedata.normalize("NFC", s or "")
    s = re.sub(r"[ \t\r\f\v]+", " ", s)
    s = re.sub(r"\n\s*\n+", "\n", s)
    return s.strip()


def download(url: str, dest: Path) -> float:
    t0 = time.perf_counter()
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 1024:
        with dest.open("rb") as fh:
            if b"%PDF-" in fh.read(1024):
                return 0.0  # cached
    last: Exception | None = None
    for attempt in range(1, 4):
        try:
            req = Request(url, headers={
                "User-Agent": "BRIQ archive migration/1.0 (+https://briqjournal.com)",
                "Accept": "application/pdf",
            })
            with urlopen(req, timeout=60) as r, dest.open("wb") as out:
                while True:
                    chunk = r.read(1024 * 1024)
                    if not chunk:
                        break
                    out.write(chunk)
            with dest.open("rb") as fh:
                if b"%PDF-" not in fh.read(1024):
                    raise RuntimeError("response is not a valid PDF")
            return time.perf_counter() - t0
        except (HTTPError, URLError, TimeoutError, OSError, RuntimeError) as e:
            last = e
            dest.unlink(missing_ok=True)
            time.sleep(min(6, attempt * 1.5))
    raise RuntimeError(f"download failed {url}: {last}")


def extract_pymupdf(pdf: Path, max_pages: int = 2) -> tuple[str, float, int]:
    import fitz  # PyMuPDF; local fast path (CI falls back to pdftotext)
    t0 = time.perf_counter()
    doc = fitz.open(pdf)
    n = len(doc)
    texts = [doc[i].get_text("text") for i in range(min(n, max_pages))]
    dt = time.perf_counter() - t0
    return "\n".join(texts), dt, n


def extract_pdftotext(pdf: Path, max_pages: int = 2) -> tuple[str, float, int]:
    t0 = time.perf_counter()
    pages = subprocess.run(
        ["pdfinfo", str(pdf)], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )
    m = re.search(r"^Pages:\s+(\d+)", pages.stdout, re.M)
    n = int(m.group(1)) if m else 0
    out = subprocess.run(
        ["pdftotext", "-layout", "-f", "1", "-l", str(min(n or max_pages, max_pages)), str(pdf), "-"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True,
    )
    return out.stdout, time.perf_counter() - t0, n


def extract_first_pages(pdf: Path, max_pages: int = 2):
    try:
        text, dt, n = extract_pymupdf(pdf, max_pages)
        return text, dt, n, "pymupdf"
    except Exception as e:
        if shutil.which("pdftotext") is None:
            raise RuntimeError(f"PyMuPDF unavailable ({e}) and pdftotext missing")
        text, dt, n = extract_pdftotext(pdf, max_pages)
        return text, dt, n, f"pdftotext (pymupdf fallback: {e})"


def parse_locale(text: str, author_names: list[str]) -> dict:
    emails = sorted(set(EMAIL_RE.findall(text)))
    orcids = sorted(set(ORCID_RE.findall(text)))
    labeled = [{"email": m.group(1), "pos": m.start()} for m in EMAIL_LABEL_RE.finditer(text)]

    bios: list[dict] = []
    for m in STAR_BIO_RE.finditer(text):
        bio = norm_space(m.group("bio"))
        bio = re.sub(r"^[\*\s]+", "", bio)
        bio = re.sub(r"\s+", " ", bio)
        bio = re.sub(r"\s*ORCID\s*:\s*[\dX\-]+$", "", bio, flags=re.I).strip()
        if len(bio) >= 40:
            bios.append({"text": bio, "email": EMAIL_LABEL_RE.search(m.group(0)).group(1) if EMAIL_LABEL_RE.search(m.group(0)) else None, "chars": len(bio), "source": "star-block"})

    # Fallback: split around each labeled email; preceding ~1200 chars containing a surname => bio candidate
    if not bios:
        for item in labeled:
            start = max(0, item["pos"] - 1500)
            window = norm_space(text[start:item["pos"]])
            window_one = re.sub(r"\s+", " ", window)
            hit = None
            for full in author_names:
                base = strip_title(full)
                surname = base.split()[-1] if base.split() else base
                if surname and len(surname) >= 3 and surname.lower() in window_one.lower():
                    hit = full
                    break
            if hit:
                # take last ~2 sentences / 800 chars as candidate
                cand = window_one[-900:].strip()
                if len(cand) >= 40:
                    bios.append({"text": cand, "email": item["email"], "chars": len(cand), "source": "email-window", "matched_author": hit})

    affiliations: list[dict] = []
    lines = [ln.strip() for ln in text.splitlines()]
    non_empty = [ln for ln in lines if ln.strip()]
    for full in author_names:
        base = strip_title(full)
        surname = base.split()[-1] if base.split() else base
        base_n = norm_name(base)
        surname_n = norm_name(surname)
        # Prefer short name-block lines ("Serhat Latifoğlu*" / "Dr. X") over long bio sentences.
        candidates_idx: list[int] = []
        for i, ln in enumerate(non_empty):
            low = norm_name(ln)
            if surname_n not in low or len(surname) < 3:
                continue
            cleaned = ln.replace("*", "").strip()
            # name block: short line where the author base (or surname) dominates
            if len(cleaned) <= len(base) + 30 and (base_n in low or norm_name(cleaned).startswith(surname_n[:4])):
                candidates_idx.append(i)
        # fallback: any line containing surname if no short block found
        if not candidates_idx:
            for i, ln in enumerate(non_empty):
                if surname_n in norm_name(ln):
                    candidates_idx.append(i)
                    break
        cand_lines: list[str] = []
        # try candidates last-first (title block usually after bio in PyMuPDF order)
        for idx in sorted(candidates_idx, reverse=True):
            trial: list[str] = []
            for ln in non_empty[idx + 1: idx + 4]:
                if EMAIL_RE.search(ln) or ORCID_RE.search(ln) or ln.startswith("*"):
                    break
                if re.match(r"^(Geliş|Kabul|Received|Accepted|Atıf|How to cite|Çevirmen|Translation)", ln, re.I):
                    break
                if len(ln) < 3 or len(ln) > 220:
                    continue
                # skip continuation of bio (long sentence with verb suffix)
                if len(ln) > 120 and surname_n in norm_name(ln):
                    break
                trial.append(ln)
            if trial:
                cand_lines = trial
                break
        affiliations.append({"author": full, "candidate_lines": cand_lines})

    return {"emails": emails, "orcids": orcids, "labeled_emails": labeled, "bios": bios, "affiliations": affiliations}


def process_slug(slug: str, locales: list[str], cache: Path) -> dict:
    t_total0 = time.perf_counter()
    meta_path = ROOT / "content" / "articles" / slug / "metadata.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    author_names = [a.get("displayName", "").strip() for a in meta.get("authors", []) if a.get("displayName")]
    urls = meta.get("urls", {})
    result: dict = {"slug": slug, "authors": author_names, "locales": {}}
    for loc in locales:
        key = "pdfTr" if loc == "tr" else "pdfEn"
        url = urls.get(key)
        if not url:
            result["locales"][loc] = {"status": "no_pdf_url"}
            continue
        dest = cache / f"{slug}-{loc}.pdf"
        try:
            dl = download(url, dest)
        except Exception as e:
            result["locales"][loc] = {"status": "download_failed", "pdf_url": url, "error": str(e)}
            continue
        try:
            text, dt_extract, pages, extractor = extract_first_pages(dest)
        except Exception as e:
            result["locales"][loc] = {"status": "extract_failed", "pdf_url": url, "error": str(e)}
            continue
        t_parse0 = time.perf_counter()
        parsed = parse_locale(text, author_names)
        dt_parse = time.perf_counter() - t_parse0
        result["locales"][loc] = {
            "status": "ok",
            "pdf_url": url,
            "pdf_pages": pages,
            "extractor": extractor,
            "download_s": round(dl, 3),
            "extract_s": round(dt_extract, 3),
            "parse_s": round(dt_parse, 3),
            "first_page_chars": len(text),
            **parsed,
        }
    result["total_s"] = round(time.perf_counter() - t_total0, 3)
    return result


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug", nargs="?", help="article slug")
    ap.add_argument("--all", action="store_true", help="process all articles")
    ap.add_argument("--limit", type=int, default=0, help="limit for --all")
    ap.add_argument("--locale", default="both", choices=["both", "tr", "en"])
    ap.add_argument("--cache-dir", default=str(CACHE_DIR))
    ap.add_argument("--out-dir", default=str(OUT_DIR))
    args = ap.parse_args()

    locales = ["tr", "en"] if args.locale == "both" else [args.locale]
    cache = Path(args.cache_dir)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    if args.all:
        slugs = sorted(p.name for p in (ROOT / "content" / "articles").iterdir() if (p / "metadata.json").exists())
        if args.limit:
            slugs = slugs[: args.limit]
    elif args.slug:
        slugs = [args.slug]
    else:
        ap.error("provide SLUG or --all")

    for slug in slugs:
        print(f"EXTRACT {slug} {'+'.join(locales)}", flush=True)
        try:
            res = process_slug(slug, locales, cache)
        except Exception as e:
            print(f"FAILED {slug}: {e}", flush=True)
            continue
        out = out_dir / f"{slug}.json"
        out.write_text(json.dumps(res, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        for loc, r in res.get("locales", {}).items():
            if r.get("status") != "ok":
                print(f"  [{loc}] {r.get('status')}: {r.get('error', '')}", flush=True)
                continue
            print(f"  [{loc}] {r['extractor']} dl={r['download_s']}s extract={r['extract_s']}s parse={r['parse_s']}s "
                  f"emails={r['emails']} orcids={r['orcids']} bios={len(r['bios'])}", flush=True)
            for b in r["bios"][:2]:
                print(f"    bio[{b['source']},{b['chars']}ch]: {b['text'][:220]}…", flush=True)
        print(f"  total={res['total_s']}s -> {out.relative_to(ROOT)}", flush=True)


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        sys.exit(1)
