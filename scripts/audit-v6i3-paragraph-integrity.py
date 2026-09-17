#!/usr/bin/env python3
import json
import re
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ISSUE = json.loads((ROOT / 'content/issues/v06-i03.json').read_text())

TERMINAL = tuple('.?!…:;”’\")]}')

def norm(s):
    s = s.replace('\u00ad', '')
    s = re.sub(r'\s+', ' ', s).strip().lower()
    return s

def short(s, n=105):
    s = re.sub(r'\s+', ' ', s).strip()
    return s if len(s) <= n else s[:n-1] + '…'

def continuation_score(a, b):
    a = a.strip(); b = b.strip()
    score = 0
    if not a or not b:
        return 0
    if not a.endswith(TERMINAL):
        score += 3
    if b[:1].islower():
        score += 3
    if re.match(r'^(of|and|or|but|to|in|on|at|for|from|with|as|by|than|that|which|who|whose|where|when|while|after|before|because|therefore|thus|however|also|the|a|an)\b', b, re.I):
        score += 2
    if re.search(r'\b(and|or|but|to|of|in|on|at|for|from|with|as|by|the|a|an)$', a, re.I):
        score += 3
    if len(a) < 55 or len(b) < 55:
        score += 1
    return score

print('=== V6I3 PARAGRAPH INTEGRITY DIAGNOSTIC ===')
total_candidates = 0
total_dupes = 0
for slug in ISSUE['articles']:
    base = ROOT / 'content/articles' / slug / 'fulltext'
    for locale in ('en', 'tr'):
        p = base / f'{locale}.json'
        if not p.exists():
            continue
        d = json.loads(p.read_text())
        for sec in d.get('sections', []):
            paras = sec.get('paragraphs') or []
            for i in range(len(paras)-1):
                a, b = paras[i], paras[i+1]
                score = continuation_score(a, b)
                if score >= 5:
                    total_candidates += 1
                    print(f'CANDIDATE\t{slug}\t{locale}\t{sec.get("title","")}\t{i}\tscore={score}\t{short(a[-120:])} || {short(b[:120])}')
                na, nb = norm(a), norm(b)
                if min(len(na), len(nb)) >= 80:
                    ratio = SequenceMatcher(None, na, nb).ratio()
                    prefix = na.startswith(nb[:min(80,len(nb))]) or nb.startswith(na[:min(80,len(na))])
                    if ratio >= .78 or prefix:
                        total_dupes += 1
                        print(f'DUPLICATE\t{slug}\t{locale}\t{sec.get("title","")}\t{i}\tratio={ratio:.3f}\t{short(a)} || {short(b)}')
print(f'SUMMARY candidates={total_candidates} duplicates={total_dupes}')
