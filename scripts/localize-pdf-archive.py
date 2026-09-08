#!/usr/bin/env python3
"""Download every legacy BRIQ PDF and point the archive inventory at local files."""

from __future__ import annotations

import concurrent.futures
import hashlib
import json
import os
import time
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
ARCHIVE_DATA = ROOT / "app" / "archive-data.json"
PDF_ROOT = ROOT / "public" / "assets" / "archive" / "pdfs"
MANIFEST = PDF_ROOT / "manifest.json"

REPORTS = [
    {
        "number": 5,
        "tr": "https://briqjournal.com/sites/default/files/yillik-raporlar/2025-03/BRIQBes%CC%A7inciY%C4%B1lRaporu.pdf",
        "en": "https://briqjournal.com/sites/default/files/yillik-raporlar/2025-03/BRIQ5thAnnualReport.pdf",
    },
    {
        "number": 4,
        "tr": "https://briqjournal.com/sites/default/files/yillik-raporlar/2024-03/BRIQ%204.%20Y%C4%B1l%20Raporu.pdf",
        "en": "https://briqjournal.com/sites/default/files/yillik-raporlar/2024-03/BRIQ%204th%20Year%20Report.pdf",
    },
    {
        "number": 3,
        "tr": "https://briqjournal.com/sites/default/files/yillik-raporlar/2023-03/BRIQ%203.Y%C4%B1l%20Raporu.pdf",
        "en": "https://briqjournal.com/sites/default/files/yillik-raporlar/2023-03/BRIQ%20Third%20Year%20Report.pdf",
    },
    {
        "number": 2,
        "tr": "https://briqjournal.com/sites/default/files/yillik-raporlar/2023-03/BRIQ%20%C4%B0kinci%20Y%C4%B1l%20Rapor%20TR.pdf",
        "en": "https://briqjournal.com/sites/default/files/yillik-raporlar/2023-03/BRIQ%20Second%20Year%20Report%20ENG.pdf",
    },
    {
        "number": 1,
        "tr": "https://briqjournal.com/sites/default/files/yillik-raporlar/2023-03/briq-birinci-yil-raporu.pdf",
        "en": "https://briqjournal.com/sites/default/files/yillik-raporlar/2023-03/briq-first-year-report.pdf",
    },
]

KNOWN_LOCAL_ISSUES = {
    (7, 3, "tr"): "/assets/issues/briq-cilt-7-sayi-3-yaz-2026-tr.pdf",
    (7, 3, "en"): "/assets/issues/briq-cilt-7-sayi-3-yaz-2026.pdf",
    (7, 4, "tr"): "/assets/issues/briq-cilt-7-sayi-4-sonbahar-2026.pdf",
    (7, 4, "en"): "/assets/issues/briq-cilt-7-sayi-4-sonbahar-2026.pdf",
}


def local_file(public_url: str) -> Path:
    return ROOT / "public" / public_url.removeprefix("/")


def is_pdf(path: Path) -> bool:
    if not path.is_file() or path.stat().st_size < 1024:
        return False
    with path.open("rb") as handle:
        return b"%PDF-" in handle.read(1024)


def download(url: str, destination: Path, attempts: int = 5) -> dict[str, Any]:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if is_pdf(destination):
        payload = destination.read_bytes()
        return {
            "source": url,
            "local": f"/{destination.relative_to(ROOT / 'public').as_posix()}",
            "bytes": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
            "status": "existing",
        }

    last_error: Exception | None = None
    partial = destination.with_suffix(destination.suffix + ".part")
    for attempt in range(1, attempts + 1):
        try:
            request = Request(
                url,
                headers={
                    "User-Agent": "BRIQ archive migration/1.0 (+https://briqjournal.com)",
                    "Accept": "application/pdf",
                },
            )
            with urlopen(request, timeout=90) as response, partial.open("wb") as output:
                while chunk := response.read(1024 * 1024):
                    output.write(chunk)
            if not is_pdf(partial):
                raise RuntimeError("response is not a valid PDF")
            os.replace(partial, destination)
            payload = destination.read_bytes()
            return {
                "source": url,
                "local": f"/{destination.relative_to(ROOT / 'public').as_posix()}",
                "bytes": len(payload),
                "sha256": hashlib.sha256(payload).hexdigest(),
                "status": "downloaded",
            }
        except (HTTPError, URLError, TimeoutError, OSError, RuntimeError) as error:
            last_error = error
            partial.unlink(missing_ok=True)
            if attempt < attempts:
                time.sleep(min(8, attempt * 1.5))
    raise RuntimeError(f"Could not download {url}: {last_error}")


def choose_local(source: str, suggested: str, source_to_local: dict[str, str]) -> str:
    if source in source_to_local:
        return source_to_local[source]
    source_to_local[source] = suggested
    return suggested


def main() -> None:
    data = json.loads(ARCHIVE_DATA.read_text(encoding="utf-8"))
    source_to_local: dict[str, str] = {}

    for issue in data["issues"]:
        volume = issue["volume"]
        issue_number = issue["issue"]
        for locale in ("tr", "en"):
            source = issue.get(f"pdf_{locale}_source")
            if not source:
                continue
            known = KNOWN_LOCAL_ISSUES.get((volume, issue_number, locale))
            suggested = known or f"/assets/archive/pdfs/issues/cilt-{volume}-sayi-{issue_number}-{locale}.pdf"
            local = choose_local(source, suggested, source_to_local)
            issue[f"pdf_{locale}_local"] = local

    for article in data["articles"]:
        for locale in ("tr", "en"):
            source = article.get(f"pdf_{locale}_source")
            existing = article.get(f"pdf_{locale}_local")
            if existing and is_pdf(local_file(existing)):
                if source:
                    source_to_local[source] = existing
                continue
            if not source:
                continue
            suggested = f"/assets/archive/pdfs/articles/{article['slug']}-{locale}.pdf"
            article[f"pdf_{locale}_local"] = choose_local(source, suggested, source_to_local)

        if article.get("shared_bilingual_pdf") and article.get("pdf_tr_local") and not article.get("pdf_en_local"):
            article["pdf_en_local"] = article["pdf_tr_local"]

    report_locals: dict[str, dict[str, str]] = {}
    for report in REPORTS:
        number = report["number"]
        report_locals[str(number)] = {}
        for locale in ("tr", "en"):
            source = report[locale]
            suggested = f"/assets/archive/pdfs/reports/briq-{number}-yil-raporu-{locale}.pdf"
            report_locals[str(number)][locale] = choose_local(source, suggested, source_to_local)

    jobs = [(source, local_file(local)) for source, local in source_to_local.items()]
    print(f"Localizing {len(jobs)} unique PDF files", flush=True)
    results: list[dict[str, Any]] = []
    failures: list[str] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
        future_map = {
            executor.submit(download, source, destination): source
            for source, destination in jobs
        }
        for position, future in enumerate(concurrent.futures.as_completed(future_map), start=1):
            try:
                results.append(future.result())
            except Exception as error:
                failures.append(str(error))
            if position % 25 == 0 or position == len(future_map):
                total_bytes = sum(item["bytes"] for item in results)
                print(
                    f"PDFs {position}/{len(future_map)}; valid {len(results)}; "
                    f"failures {len(failures)}; {total_bytes / (1024 * 1024):.1f} MiB",
                    flush=True,
                )

    if failures:
        for failure in failures:
            print(failure)
        raise RuntimeError(f"{len(failures)} PDF files could not be localized")

    missing = [local for local in source_to_local.values() if not is_pdf(local_file(local))]
    if missing:
        raise RuntimeError(f"{len(missing)} localized PDF paths failed validation")

    data["pdf_archive"] = {
        "localized": True,
        "unique_files": len(source_to_local),
        "reports": report_locals,
    }
    temporary_data = ARCHIVE_DATA.with_suffix(".json.tmp")
    temporary_data.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    os.replace(temporary_data, ARCHIVE_DATA)

    results.sort(key=lambda item: item["local"])
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(
        json.dumps(
            {
                "generated_from": "https://briqjournal.com",
                "unique_files": len(results),
                "total_bytes": sum(item["bytes"] for item in results),
                "files": results,
            },
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )
    print(
        f"Localized {len(results)} PDFs "
        f"({sum(item['bytes'] for item in results) / (1024 * 1024):.1f} MiB)",
        flush=True,
    )


if __name__ == "__main__":
    main()
