#!/usr/bin/env python3
"""Publish the verified English BRIQ article archive, leaving seven unresolved PDFs untouched.

This run intentionally handles only textual publications whose legacy English article PDF
can be verified. Visual-only contributions are not treated as full-text articles; when a
visual contribution has no separate English PDF, the Turkish/local PDF is shared across
both locales. Seven known historical PDF mismatches are left untouched for manual archive
replacement.
"""

from __future__ import annotations

import concurrent.futures
import hashlib
import importlib.util
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE_DATA = ROOT / "app" / "archive-data.json"
FULLTEXT_OUT = ROOT / "app" / "article-fulltext-en-archive.json"
MANIFEST = ROOT / "public" / "assets" / "archive" / "pdfs" / "manifest.json"
ARTICLE_PLATFORM = ROOT / "app" / "components" / "ArticlePlatform.tsx"
ARCHIVE_TS = ROOT / "app" / "archive.ts"
TR_ROUTE = ROOT / "app" / "[...slug]" / "page.tsx"
EN_ROUTE = ROOT / "app" / "en" / "[...slug]" / "page.tsx"
STAGE = ROOT / "tmp" / "english-pdf-ready"
REPORT = ROOT / "tmp" / "english-ready-report.json"
UPLOAD_LIST = ROOT / "tmp" / "english-ready-upload.tsv"

UNRESOLVED = {
    "kulturel-ozguveni-percinleyelim",
    "bes-deniz-stratejisini-canlandirmak-mumkun-mu",
    "turkiye-ve-cinin-degisen-deniz-jeopolitiginin-neo-mahanci-bir-okumasi",
    "mavi-vatan-doktrini-nasil-olustu",
    "mare-nostrumdan-denizlerde-uluslararasi-isbirligine-tarih-akdenizin-gelecegi-ile-ilgili",
    "gaz-hidratlar-yakin-gelecegin-enerji-kaynagi",
    "karabag-baslangictan-gunumuze-sorunlar-ve-cozumler",
}


def load_repair_module():
    path = ROOT / "scripts" / "repair-english-article-archive.py"
    spec = importlib.util.spec_from_file_location("briq_repair", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Could not load repair helper module")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


repair = load_repair_module()


def is_visual(article: dict[str, Any]) -> bool:
    text = " ".join(
        str(article.get(key) or "")
        for key in ("slug", "title_tr", "title_en", "citation_tr", "citation_en", "abstract_tr", "abstract_en")
    ).lower()
    return bool(re.search(
        r"fotoğraf|photograph|karikatür|cartoon|(?:^|\W)afiş(?:\W|$)|poster|(?:^|\W)resim(?:\W|$)|tablosu|painting|visual contribution",
        text,
        flags=re.I,
    ))


def validate_identity(text: str, job: dict[str, Any]) -> bool:
    return repair.validate_title(text, job.get("title_en")) or (
        bool(job.get("abstract_en")) and repair.validate_title(text, job.get("abstract_en"))
    )


def process_job(job: dict[str, Any]) -> dict[str, Any]:
    slug = job["slug"]
    destination = STAGE / f"{slug}-en.pdf"
    payload = repair.curl_bytes(job["pdf_en_source"], referer=job["source_en"], timeout=300)
    if len(payload) < 10_000 or not payload.startswith(b"%PDF-"):
        raise RuntimeError(f"{slug}: invalid PDF response ({len(payload)} bytes)")
    destination.write_bytes(payload)

    info = repair.pdf_info(destination)
    if info["pages"] < 1:
        raise RuntimeError(f"{slug}: PDF has no pages")

    with tempfile.TemporaryDirectory(prefix="briq-ready-render-") as temp_dir:
        preview_prefix = Path(temp_dir) / "page"
        repair.run([
            "pdftoppm", "-f", "1", "-singlefile", "-png", "-r", "72",
            str(destination), str(preview_prefix),
        ], timeout=180)
        preview = preview_prefix.with_suffix(".png")
        if not preview.is_file() or preview.stat().st_size < 1000:
            raise RuntimeError(f"{slug}: render verification failed")

    text_path = destination.with_suffix(".txt")
    proc = subprocess.run(
        ["pdftotext", "-layout", str(destination), str(text_path)],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=240,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"{slug}: pdftotext failed: {proc.stderr[-500:]}")
    layout_text = text_path.read_text(encoding="utf-8", errors="replace")
    text_path.unlink(missing_ok=True)
    normalized = repair.normalize_space(layout_text)
    if len(normalized) < 80:
        raise RuntimeError(f"{slug}: too little selectable text ({len(normalized)} chars)")

    en_score, tr_score = repair.english_score(normalized[:50000])
    if len(normalized) > 1000 and en_score < 8 and tr_score > en_score * 1.4:
        raise RuntimeError(f"{slug}: extracted text appears non-English (en={en_score}, tr={tr_score})")
    if not validate_identity(normalized, job):
        raise RuntimeError(f"{slug}: title/abstract does not match downloaded PDF text")

    fulltext = repair.build_fulltext(layout_text)
    if not fulltext.get("sections"):
        raise RuntimeError(f"{slug}: no full-text sections extracted")

    digest = hashlib.sha256(payload).hexdigest()
    local = f"/assets/archive/pdfs/articles/{slug}-en.pdf"
    return {
        **job,
        "local": local,
        "bytes": len(payload),
        "sha256": digest,
        "pages": info["pages"],
        "text_chars": len(normalized),
        "fulltext": fulltext,
        "stage": str(destination),
    }


def patch_article_platform() -> None:
    text = ARTICLE_PLATFORM.read_text(encoding="utf-8")
    import_line = 'import archiveEnglishFullTextJson from "../article-fulltext-en-archive.json";\n'
    if import_line not in text:
        anchor = 'import saudiEnglishFullTextJson from "../article-fulltext-saudi-en.json";\n'
        if anchor not in text:
            raise RuntimeError("ArticlePlatform import anchor not found")
        text = text.replace(anchor, anchor + import_line, 1)

    const_line = 'const archiveEnglishFullText = archiveEnglishFullTextJson as Record<string, LocalizedFullText>;\n'
    if const_line not in text:
        anchor = 'const currentFullText = fullTextJson as Record<string, CurrentFullTextRecord>;\n'
        if anchor not in text:
            raise RuntimeError("ArticlePlatform full-text constant anchor not found")
        text = text.replace(anchor, anchor + const_line, 1)

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
        : (archivedEnglishFullText || storedFullText))
    : storedFullText;
'''
    if old in text:
        text = text.replace(old, new, 1)
    elif "const archivedEnglishFullText = archiveEnglishFullText[article.slug];" not in text:
        raise RuntimeError("ArticlePlatform selection anchor not found")
    ARTICLE_PLATFORM.write_text(text, encoding="utf-8")


def patch_categories() -> None:
    text = ARCHIVE_TS.read_text(encoding="utf-8")
    old = 'return label("Hakemli Makale", "Peer-reviewed Article");'
    new = 'return label("Araştırma Makalesi", "Research Article");'
    if old in text:
        text = text.replace(old, new, 1)
    elif new not in text:
        raise RuntimeError("publicationType default label anchor not found")
    ARCHIVE_TS.write_text(text, encoding="utf-8")

    tr = TR_ROUTE.read_text(encoding="utf-8")
    old_tr = '<small>{publication.pages ? `ss. ${publication.pages}` : "Yayın kaydı"}{publication.doi ? ` · DOI: ${publication.doi}` : ""}</small>'
    new_tr = '<small>{publicationType(publication, "tr")} · {publication.pages ? `ss. ${publication.pages}` : "Yayın kaydı"}{publication.doi ? ` · DOI: ${publication.doi}` : ""}</small>'
    if old_tr in tr:
        tr = tr.replace(old_tr, new_tr, 1)
    elif new_tr not in tr:
        raise RuntimeError("Turkish archive issue category anchor not found")
    TR_ROUTE.write_text(tr, encoding="utf-8")

    en = EN_ROUTE.read_text(encoding="utf-8")
    old_en = '<a href={`/en/articles/${publication.slug}`} key={publication.slug}><small>{publication.pages ? `pp. ${publication.pages}` : "Publication record"}{publication.doi ? ` · DOI: ${publication.doi}` : ""}</small><h3>{publication.title_en || publication.title_tr}</h3><p>{publication.author}</p></a>'
    new_en = '<a href={`/en/articles/${publication.slug}`} key={publication.slug}><small>{publicationType(publication, "en")} · {publication.pages ? `pp. ${publication.pages}` : "Publication record"}{publication.doi ? ` · DOI: ${publication.doi}` : ""}</small><h3>{publication.title_en || publication.title_tr}</h3><p>{publication.author}</p></a>'
    if old_en in en:
        en = en.replace(old_en, new_en, 1)
    elif new_en not in en:
        raise RuntimeError("English archive issue category anchor not found")
    EN_ROUTE.write_text(en, encoding="utf-8")


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
            "note": "Exact designed English article PDF archived from the legacy BRIQ English article page.",
        }
    files = sorted(by_local.values(), key=lambda entry: entry.get("local", ""))
    manifest["files"] = files
    manifest["unique_files"] = len(files)
    manifest["total_bytes"] = sum(int(entry.get("bytes") or 0) for entry in files)
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    for binary in ("curl", "pdfinfo", "pdftotext", "pdftoppm"):
        if not shutil.which(binary):
            raise RuntimeError(f"Missing required binary: {binary}")

    STAGE.mkdir(parents=True, exist_ok=True)
    for old in STAGE.glob("*-en.pdf"):
        old.unlink()
    REPORT.parent.mkdir(parents=True, exist_ok=True)

    data = json.loads(ARCHIVE_DATA.read_text(encoding="utf-8"))
    articles = data.get("articles", [])
    visuals = [article for article in articles if is_visual(article)]
    textual = [article for article in articles if not is_visual(article)]
    targets = [article for article in textual if article.get("slug") not in UNRESOLVED]

    missing_unresolved = sorted(UNRESOLVED - {article.get("slug") for article in articles})
    if missing_unresolved:
        raise RuntimeError(f"Unresolved slugs missing from archive: {missing_unresolved}")
    if len(targets) != 234:
        raise RuntimeError(f"Expected 234 ready textual publications, found {len(targets)}")

    # Textless visual contributions share the same PDF when no distinct English asset exists.
    shared_visuals = 0
    for article in visuals:
        if not article.get("pdf_en_source") or article.get("pdf_en_source") == article.get("pdf_tr_source"):
            if article.get("pdf_tr_source"):
                article["pdf_en_source"] = article.get("pdf_tr_source")
            if article.get("pdf_tr_local"):
                article["pdf_en_local"] = article.get("pdf_tr_local")
            article["shared_bilingual_pdf"] = True
            shared_visuals += 1

    print(f"Ready textual publications: {len(targets)}; visuals: {len(visuals)}; shared visual PDFs: {shared_visuals}", flush=True)

    discovered: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []
    for index, article in enumerate(targets, start=1):
        try:
            discovered.append(repair.discover_article(article))
        except Exception as error:
            failures.append({"slug": article.get("slug", "?"), "error": str(error)})
        if index % 25 == 0 or index == len(targets):
            print(f"Discovery {index}/{len(targets)}; ok={len(discovered)} failures={len(failures)}", flush=True)
    if failures:
        REPORT.write_text(json.dumps({"phase": "discovery", "failures": failures}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        raise RuntimeError(f"Discovery failed for {len(failures)} ready publications")

    print(f"Downloading and verifying {len(discovered)} English PDFs", flush=True)
    results: list[dict[str, Any]] = []
    failures = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_map = {executor.submit(process_job, job): job for job in discovered}
        for index, future in enumerate(concurrent.futures.as_completed(future_map), start=1):
            job = future_map[future]
            try:
                results.append(future.result())
            except Exception as error:
                failures.append({"slug": job["slug"], "error": str(error)})
            if index % 10 == 0 or index == len(discovered):
                mb = sum(item["bytes"] for item in results) / (1024 * 1024)
                print(f"PDF/text {index}/{len(discovered)}; ok={len(results)} failures={len(failures)}; {mb:.1f} MiB", flush=True)
    results.sort(key=lambda item: item["slug"])
    if failures:
        REPORT.write_text(json.dumps({"phase": "download-extract", "succeeded": len(results), "failures": failures}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        for failure in failures:
            print(f"FAIL {failure['slug']}: {failure['error']}")
        raise RuntimeError(f"Verification failed for {len(failures)} ready publications")
    if len(results) != 234:
        raise RuntimeError(f"Expected 234 verified PDFs, got {len(results)}")

    result_by_slug = {item["slug"]: item for item in results}
    fulltext: dict[str, Any] = {}
    if FULLTEXT_OUT.exists():
        try:
            fulltext.update(json.loads(FULLTEXT_OUT.read_text(encoding="utf-8")))
        except Exception:
            pass

    for article in targets:
        item = result_by_slug[article["slug"]]
        article["source_en"] = item["source_en"]
        article["pdf_en_source"] = item["pdf_en_source"]
        article["pdf_en_local"] = item["local"]
        article["shared_bilingual_pdf"] = False
        if item.get("title_en"):
            article["title_en"] = item["title_en"]
        if item.get("abstract_en"):
            article["abstract_en"] = item["abstract_en"]
        fulltext[article["slug"]] = item["fulltext"]

    # Do not retain accidentally generated full text for the seven unresolved records.
    for slug in UNRESOLVED:
        fulltext.pop(slug, None)

    ARCHIVE_DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    FULLTEXT_OUT.write_text(json.dumps(fulltext, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    update_manifest(results)
    patch_article_platform()
    patch_categories()

    with UPLOAD_LIST.open("w", encoding="utf-8") as handle:
        for item in results:
            handle.write(f"{item['stage']}\t{item['local'].lstrip('/')}\t{item['bytes']}\t{item['sha256']}\n")

    report = {
        "phase": "complete",
        "archive_records": len(articles),
        "visual_records": len(visuals),
        "shared_visual_pdf_records": shared_visuals,
        "unresolved_records": sorted(UNRESOLVED),
        "published_english_pdfs": len(results),
        "published_fulltexts": len([slug for slug in fulltext if slug not in UNRESOLVED]),
        "total_pdf_bytes": sum(item["bytes"] for item in results),
        "records": [
            {key: item[key] for key in ("slug", "source_en", "pdf_en_source", "local", "bytes", "sha256", "pages", "text_chars")}
            for item in results
        ],
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: report[key] for key in report if key != "records"}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
