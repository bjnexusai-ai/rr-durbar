#!/usr/bin/env bash
# RR Durbar website deploy to the CLIENT account. Usage: ./ship.sh preview | ./ship.sh live
set -u
ACCT=5b5f3bb8c3802db369e42250ac298717
SUB=ramana-peravali.workers.dev
case "${1:-}" in
  preview) CFG=wrangler.preview.jsonc; URL=https://rr-durbar-preview.$SUB ;;
  live)    CFG=wrangler.jsonc;         URL=https://rr-durbar.$SUB ;;
  *) echo "Usage: ./ship.sh preview|live"; exit 1 ;;
esac
cd "$(dirname "$0")" || exit 1
git status --porcelain public wrangler*.jsonc | grep -q . && echo "WARNING: uncommitted changes in public/ or wrangler config"
git log --oneline -1
read -rsp "CLIENT Cloudflare API token (hidden): " CLOUDFLARE_API_TOKEN && echo
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=$ACCT
npx wrangler deploy -c "$CFG" 2>&1 | tail -8
unset CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
sleep 5
h() { sha256sum | cut -c1-16; }
LH=$(h < public/index.html); LC=$(h < public/checkout/index.html)
RH=$(curl -s "$URL/" | h); RC=$(curl -s "$URL/checkout/" | h)
echo "== $URL"
echo "home     local $LH  remote $RH  $([ "$LH" = "$RH" ] && echo OK || echo MISMATCH)"
echo "checkout local $LC  remote $RC  $([ "$LC" = "$RC" ] && echo OK || echo MISMATCH)"
