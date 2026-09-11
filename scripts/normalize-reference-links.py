#!/usr/bin/env python3
"""Repair URL/DOI whitespace artefacts introduced by PDF text extraction.

The script intentionally performs only URL-shaped replacements so article prose and
bibliographic wording are not rewritten. It is safe to rerun after future imports.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = sorted((ROOT / "app").glob("article-fulltext*.json"))

PROTOCOL = re.compile(r"\b(https?)\s*:\s*/\s*/", re.I)
DOI_HOST = re.compile(r"https?://(?:dx\s*\.\s*)?doi\s*\.\s*org\s*/\s*", re.I)
URL_HOST = re.compile(r"https?://(?:[a-z0-9-]+\s*\.\s*)+[a-z]{2,63}", re.I)
DOI_PREFIX = re.compile(r"\b10\s*\.\s*(\d{4,9})\s*/\s*", re.I)
DOI_LABEL = re.compile(r"\bdoi\s*:\s*(10\.\d{4,9}/[-._;()/:A-Z0-9]+)", re.I)
URL_BEFORE_PUNCT = re.compile(r"(https?://[^\s<>\[\]{}]+)\s+([/?#&=:%])\s*", re.I)

SUSPICIOUS = [
    re.compile(r"https?://[^\s\"']*\.\s+[a-z]{2,63}(?:/|\\u002f)", re.I),
    re.compile(r"https?://(?:dx\s*\.\s*)?doi\s*\.\s*org", re.I),
    re.compile(r"\b10\s+\.\s*\d{4,9}\s*/", re.I),
    re.compile(r"\b10\s*\.\s*\d{4,9}\s+/", re.I),
]


def normalize(text: str) -> str:
    text = PROTOCOL.sub(lambda m: f"{m.group(1).lower()}://", text)
    text = DOI_HOST.sub("https://doi.org/", text)
    text = URL_HOST.sub(lambda m: re.sub(r"\s+", "", m.group(0)), text)
    text = DOI_PREFIX.sub(r"10.\1/", text)
    text = DOI_LABEL.sub(r"https://doi.org/\1", text)
    for _ in range(4):
        text = URL_BEFORE_PUNCT.sub(r"\1\2", text)
    return text


def main() -> int:
    total_changes = 0
    changed_files = 0
    suspicious: list[tuple[str, str]] = []

    for path in FILES:
        original = path.read_text(encoding="utf-8")
        normalized = normalize(original)
        if normalized != original:
            changed_files += 1
            before_lines = original.splitlines()
            after_lines = normalized.splitlines()
            total_changes += sum(a != b for a, b in zip(before_lines, after_lines))
            total_changes += abs(len(before_lines) - len(after_lines))
            path.write_text(normalized, encoding="utf-8")

        for pattern in SUSPICIOUS:
            for match in pattern.finditer(normalized):
                start = max(0, match.start() - 80)
                end = min(len(normalized), match.end() + 120)
                suspicious.append((path.name, normalized[start:end].replace("\n", " ")))
                if len(suspicious) >= 20:
                    break
            if len(suspicious) >= 20:
                break

    print(f"Reference-link cleanup: {changed_files} file(s) changed; ~{total_changes} affected line(s).")
    if suspicious:
        print("Suspicious URL/DOI whitespace remains:")
        for filename, sample in suspicious:
            print(f"- {filename}: {sample}")
        return 2

    print("Audit passed: no known broken URL/DOI whitespace patterns remain.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
