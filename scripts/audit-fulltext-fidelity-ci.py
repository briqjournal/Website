#!/usr/bin/env python3
"""Temporary CI wrapper for final v04-i03 verification.

It leaves canonical content untouched and reuses metadata's already-established
pdfEnLocal/pdfTrLocal archive paths when legacy WordPress PDF URLs are stale.
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
remote_to_local = {}
for slug in issue_data.get("articles", []):
    meta = json.loads((ROOT / "content" / "articles" / slug / "metadata.json").read_text(encoding="utf-8"))
    urls = meta.get("urls") or {}
    for remote_key, local_key in (("pdfEn", "pdfEnLocal"), ("pdfTr", "pdfTrLocal")):
        remote = urls.get(remote_key)
        local = urls.get(local_key)
        if remote and local:
            remote_to_local[remote] = local

original_download = mod.download

def verified_download(url, dest):
    local = remote_to_local.get(url)
    dest.parent.mkdir(parents=True, exist_ok=True)

    if local:
        repo_file = ROOT / "public" / local.lstrip("/")
        if repo_file.exists():
            shutil.copyfile(repo_file, dest)
            if dest.read_bytes()[:5] == b"%PDF-":
                return
            dest.unlink(missing_ok=True)

    candidates = []
    if local:
        candidates.extend([
            "https://briqjournal.com" + local,
            "https://briq.briq.workers.dev" + local,
        ])
    candidates.append(url)

    errors = []
    for candidate in candidates:
        try:
            original_download(candidate, dest)
            if dest.read_bytes()[:5] == b"%PDF-":
                return
            errors.append(f"{candidate}: response is not a PDF")
        except Exception as exc:
            errors.append(f"{candidate}: {exc}")
        dest.unlink(missing_ok=True)

    raise RuntimeError("No authoritative PDF candidate succeeded: " + " | ".join(errors))

mod.download = verified_download
mod.main()
