#!/usr/bin/env python3
"""Temporary CI wrapper for final v04-i03 verification.

Canonical content stays untouched. The verifier prefers each article's official
PDF, then falls back to the official locale issue PDF declared in the issue
manifest when a legacy article-level URL is stale.
"""
import importlib.util
import json
import shutil
import sys
from pathlib import Path

ROOT = Path.cwd()
SCRIPT = ROOT / "scripts" / "audit-fulltext-fidelity.py"
spec = importlib.util.spec_from_file_location("briq_fidelity_audit", SCRIPT)
mod = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(mod)

issue = sys.argv[1] if len(sys.argv) > 1 else ""
issue_data = json.loads((ROOT / "content" / "issues" / f"{issue}.json").read_text(encoding="utf-8"))
remote_info = {}
for slug in issue_data.get("articles", []):
    meta = json.loads((ROOT / "content" / "articles" / slug / "metadata.json").read_text(encoding="utf-8"))
    urls = meta.get("urls") or {}
    for loc, remote_key, local_key in (
        ("en", "pdfEn", "pdfEnLocal"),
        ("tr", "pdfTr", "pdfTrLocal"),
    ):
        remote = urls.get(remote_key)
        if remote:
            remote_info[remote] = {"locale": loc, "local": urls.get(local_key)}

issue_sources = {
    "en": issue_data.get("pdf_en_source"),
    "tr": issue_data.get("pdf_tr_source"),
}
issue_locals = {
    "en": issue_data.get("pdf_en_local"),
    "tr": issue_data.get("pdf_tr_local"),
}
cache_dir = ROOT / ".audit" / "issue-pdf-cache"
original_download = mod.download

def is_pdf(path):
    return path.exists() and path.read_bytes()[:5] == b"%PDF-"

def copy_if_pdf(source, dest):
    if source and source.exists() and is_pdf(source):
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, dest)
        return True
    return False

def verified_download(url, dest):
    info = remote_info.get(url) or {}
    loc = info.get("locale")
    dest.parent.mkdir(parents=True, exist_ok=True)

    local = info.get("local")
    if local and copy_if_pdf(ROOT / "public" / local.lstrip("/"), dest):
        return

    errors = []
    try:
        original_download(url, dest)
        if is_pdf(dest):
            return
        errors.append(f"{url}: response is not a PDF")
    except Exception as exc:
        errors.append(f"{url}: {exc}")
    dest.unlink(missing_ok=True)

    if loc:
        issue_local = issue_locals.get(loc)
        if issue_local and copy_if_pdf(ROOT / "public" / issue_local.lstrip("/"), dest):
            return

        issue_url = issue_sources.get(loc)
        if issue_url:
            cache = cache_dir / f"{issue}-{loc}.pdf"
            if not is_pdf(cache):
                cache.parent.mkdir(parents=True, exist_ok=True)
                try:
                    original_download(issue_url, cache)
                    if not is_pdf(cache):
                        errors.append(f"{issue_url}: response is not a PDF")
                        cache.unlink(missing_ok=True)
                except Exception as exc:
                    errors.append(f"{issue_url}: {exc}")
                    cache.unlink(missing_ok=True)
            if copy_if_pdf(cache, dest):
                return

    raise RuntimeError("No authoritative PDF candidate succeeded: " + " | ".join(errors))

mod.download = verified_download
mod.main()
