#!/usr/bin/env python3
import base64, subprocess, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
parts=["part00","part01","part02","part03","part04a","part04b","part05a","part05b","part06"]
payload="".join((ROOT/"scripts"/f"tmp-v02-i01-builder.{part}").read_text() for part in parts)
source=base64.b64decode(payload).decode("utf-8")
source=source.replace("ROOT=Path(__file__).resolve().parents[1]", "ROOT=Path(__file__).resolve().parent")
builder=ROOT/".tmp-v02-i01-builder.py"
builder.write_text(source,encoding="utf-8")
subprocess.run([sys.executable,str(builder)],check=True,cwd=ROOT)
