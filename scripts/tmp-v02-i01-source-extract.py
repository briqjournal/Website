#!/usr/bin/env python3
import base64, subprocess, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
parts=["part00","part01","part02","part03","part04a","part04b","part05a","part05b","part06"]
payload="".join((ROOT/"scripts"/f"tmp-v02-i01-builder.{part}").read_text() for part in parts)
builder=ROOT/".tmp-v02-i01-builder.py"
builder.write_bytes(base64.b64decode(payload))
subprocess.run([sys.executable,str(builder)],check=True,cwd=ROOT)
