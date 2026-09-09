#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

command -v timeout >/dev/null || {
  echo "build-verified.sh requires GNU timeout." >&2
  exit 69
}

vinext="${SITES_PROJECT_ROOT}/node_modules/.bin/vinext"
if [[ ! -x "${vinext}" ]]; then
  echo "vinext is unavailable. Run npm run install:ci and wait for it to finish before building." >&2
  exit 69
fi

echo "Running bounded vinext build..."
timeout \
  --signal=TERM \
  --kill-after="${SITES_BUILD_KILL_AFTER:-10s}" \
  "${SITES_BUILD_TIMEOUT:-3m}" \
  "${vinext}" build

client_assets="${SITES_PROJECT_ROOT}/dist/client"
if [[ -d "${client_assets}" ]]; then
  find "${client_assets}" -type f -iname '*.pdf' -delete
fi

if find "${client_assets}" -type f -iname '*.pdf' -print -quit | grep -q .; then
  echo "PDF files must not be included in dist/client; they are served from R2." >&2
  exit 65
fi

max_asset_bytes=$((25 * 1024 * 1024))
oversized_asset=0
while IFS= read -r -d '' asset; do
  asset_bytes="$(stat -c '%s' "${asset}")"
  if (( asset_bytes > max_asset_bytes )); then
    echo "Cloudflare asset exceeds 25 MiB: ${asset} (${asset_bytes} bytes)" >&2
    oversized_asset=1
  fi
done < <(find "${client_assets}" -type f -print0)

if (( oversized_asset != 0 )); then
  exit 65
fi

echo "Validated client assets: no PDFs and no file larger than 25 MiB."

"${script_dir}/validate-artifact.sh"
