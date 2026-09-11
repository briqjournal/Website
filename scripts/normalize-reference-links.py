#!/usr/bin/env python3
"""Audit PDF-extracted reference URLs and the normalization used by the site.

The source fulltext JSON is an archival extraction and is intentionally never rewritten
here. ReferenceText.tsx applies the same URL/DOI normalization at render time, so broken
PDF line-wrap whitespace is repaired for readers without altering raw source material.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
FILES = sorted((ROOT / "app").glob("article-fulltext*.json"))

PROTOCOL = re.compile(r"\b(https?)\s*:\s*/\s*/", re.I)
URL_AFTER_PROTOCOL = re.compile(r"(https?://)\s+(?=[a-z0-9-]+\.)", re.I)
DOI_HOST = re.compile(r"https?://(?:dx\s*\.\s*)?doi\s*\.\s*org\s*/\s*", re.I)
DOI_AS_HOST = re.compile(r"https?://(10\.\d{4,9}/)", re.I)
URL_HOST = re.compile(r"https?://(?:[a-z0-9-]+\s*\.\s*)+[a-z]{2,63}", re.I)
DOI_PREFIX = re.compile(r"\b10\s*\.\s*(\d{4,9})\s*/\s*", re.I)
DOI_LABEL = re.compile(r"\bdoi\s*:\s*(10\.\d{4,9}/[-._;()/:A-Z0-9]+)", re.I)
URL_BEFORE_PUNCT = re.compile(r"(https?://[^\s<>\[\]{}]+)\s+([/?#&=:%])\s*", re.I)
URL_AFTER_SLASH = re.compile(r"(https?://[^\s<>\"']*/)\s+(?=[^\s<>\"']*[./?=&%#_-])", re.I)
URL_AFTER_ESCAPE = re.compile(r"(https?://[^\s<>\"']*%[0-9A-F]{2})\s+(?=[^\s<>\"']*[./?=&%#_-])", re.I)
URL_AFTER_CONNECTOR = re.compile(r"(https?://[^\s<>\"']*[-_=&#?])\s+(?=[^\s<>\"']*[./?=&%#_-])", re.I)
URL_BEFORE_EXTENSION = re.compile(r"(https?://[^\s<>\"']*\.)\s+(?=(?:html?|shtml|pdf|php|aspx?|jsp|xml|json|tr\.mfa)\b)", re.I)
DOI_STRONG_CONTINUATION = re.compile(r"(10\.\d{4,9}/[^\s<>\"']*[-/_:;])\s+(?=[A-Z0-9])", re.I)
DOI_DOT_CONTINUATION = re.compile(r"(10\.\d{4,9}/[^\s<>\"']*\.)\s+(?=(?:\d|cnki\b|issn\b|[a-z]{1,4}\d))", re.I)

# These expressions are checked *after* normalization. Any hit therefore means a
# malformed URL/DOI pattern is not yet covered by the renderer and should fail CI.
SUSPICIOUS_REFERENCE_PATTERNS = [
    re.compile(r"https?\s+:\s*/\s*/|https?\s*:\s+/\s*/|https?\s*:\s*/\s+/", re.I),
    re.compile(r"https?://\s+(?=[a-z0-9-]+\.)", re.I),
    re.compile(r"https?://(?:dx\.)?doi(?:\s+\.\s*|\s*\.\s+)org", re.I),
    re.compile(r"https?://10\.\d{4,9}/", re.I),
    re.compile(r"https?://[^\s<>\"']*(?:[a-z0-9-]\s+\.\s*[a-z0-9-]|[a-z0-9-]\s*\.\s+[a-z0-9-])", re.I),
    re.compile(r"https?://[^\s<>\"']*/\s+(?=[^\s<>\"']*[./?=&%#_-])", re.I),
    re.compile(r"https?://[^\s<>\"']*%[0-9A-F]{2}\s+(?=[^\s<>\"']*[./?=&%#_-])", re.I),
    re.compile(r"https?://[^\s<>\"']*\.\s+(?:html?|shtml|pdf|php|aspx?|jsp|xml|json|tr\.mfa)\b", re.I),
    re.compile(r"\b10\s+\.\s*\d{4,9}\s*/", re.I),
    re.compile(r"\b10\s*\.\s*\d{4,9}\s+/", re.I),
    re.compile(r"10\.\d{4,9}/[^\s<>\"']*[-/_:;]\s+[A-Z0-9]", re.I),
    re.compile(r"10\.\d{4,9}/[^\s<>\"']*\.\s+(?:\d|cnki\b|issn\b|[a-z]{1,4}\d)", re.I),
]

URL_OR_DOI = re.compile(r"https?://|\b10\.\d{4,9}/", re.I)


def normalize(text: str) -> str:
    text = text.replace("\u00a0", " ")
    text = re.sub(r"[\t\r\n]+", " ", text)
    text = re.sub(r"\s{2,}", " ", text).strip()
    text = PROTOCOL.sub(lambda m: f"{m.group(1).lower()}://", text)
    text = URL_AFTER_PROTOCOL.sub(r"\1", text)
    text = DOI_HOST.sub("https://doi.org/", text)
    text = DOI_AS_HOST.sub(r"https://doi.org/\1", text)
    text = URL_HOST.sub(lambda m: re.sub(r"\s+", "", m.group(0)), text)
    text = DOI_PREFIX.sub(r"10.\1/", text)
    text = DOI_LABEL.sub(r"https://doi.org/\1", text)
    for _ in range(5):
        text = URL_BEFORE_PUNCT.sub(r"\1\2", text)
        text = URL_AFTER_SLASH.sub(r"\1", text)
        text = URL_AFTER_ESCAPE.sub(r"\1", text)
        text = URL_AFTER_CONNECTOR.sub(r"\1", text)
        text = URL_BEFORE_EXTENSION.sub(r"\1", text)
        text = DOI_STRONG_CONTINUATION.sub(r"\1", text)
        text = DOI_DOT_CONTINUATION.sub(r"\1", text)
    text = re.sub(r"\bdoi\s*:\s*(10\.\d{4,9}/[-._;()/:A-Z0-9]+)", r"https://doi.org/\1", text, flags=re.I)
    text = re.sub(r"\s+([,.;:])", r"\1", text)
    text = re.sub(r",\s*(\d{1,3})\s+\(([^)]+)\)(?=\s*[,.:])", r", \1(\2)", text)
    text = re.sub(r"(https?://[^\s<>]+)[.,;:]$", r"\1", text, flags=re.I)
    return text


def reference_texts(node: Any) -> Iterable[str]:
    if isinstance(node, dict):
        refs = node.get("references")
        if isinstance(refs, list):
            for ref in refs:
                if isinstance(ref, dict) and isinstance(ref.get("text"), str):
                    yield ref["text"]
        for value in node.values():
            yield from reference_texts(value)
    elif isinstance(node, list):
        for item in node:
            yield from reference_texts(item)


def main() -> int:
    total_references = 0
    references_with_links = 0
    references_normalized = 0
    suspicious: list[tuple[str, str]] = []

    for path in FILES:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            print(f"JSON parse failed for {path.name}: {exc}")
            return 3

        for raw_text in reference_texts(data):
            total_references += 1
            text = normalize(raw_text)
            if text != raw_text:
                references_normalized += 1
            if URL_OR_DOI.search(text):
                references_with_links += 1
            if any(pattern.search(text) for pattern in SUSPICIOUS_REFERENCE_PATTERNS):
                suspicious.append((path.name, text))
                if len(suspicious) >= 25:
                    break
        if len(suspicious) >= 25:
            break

    print(
        f"Reference audit: {total_references} references checked; "
        f"{references_with_links} contain URL/DOI data; "
        f"{references_normalized} require render-time normalization."
    )
    if suspicious:
        print("Malformed URL/DOI whitespace remains after normalization:")
        for filename, sample in suspicious:
            print(f"- {filename}: {sample}")
        return 2

    print("Audit passed: every known broken URL/DOI whitespace pattern is repaired at render time.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
