#!/usr/bin/env bash
# Builds both WebAssembly modules and publishes site/ to Cloudflare Pages.
#
#   bash scripts/deploy.sh
#
# Credentials come from ~/nmt/web/.env (CLOUDFLARE_EMAIL + CLOUDFLARE_API_KEY),
# the same pair every other Cloudflare task on this machine uses.
#
# Both cargo builds go through the machine-wide heavy-work lock, because a
# parallel heavy build once froze this box hard enough to need a power cycle.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${NME_ENV_FILE:-$HOME/nmt/web/.env}"
PROJECT=needmoreeasy
ACCOUNT_ID=CLOUDFLARE_ACCOUNT_ID_WAS_HERE

[ -f "$ENV_FILE" ] || { echo "no .env at $ENV_FILE" >&2; exit 1; }

cd "$REPO_ROOT"

echo "== 싣고 나갈 컴파일러가 저장소의 그 커밋인가 =="
# The site does not contain the compiler; it pins a commit and builds from it.
# A fix that was made but not pushed cannot reach the web however many times
# this runs — which is exactly what happened on 2026-08-22 — so the pin is
# checked against the language repository before anything is built.
node scripts/check-compiler-pin.mjs

echo "== 1/3  컴파일러 wasm 빌드 =="
( cd crates/nme-web && flock -w 3600 /tmp/big-heavy.lock -c \
    "wasm-pack build --release --target web --out-dir ../../site/assets/wasm --out-name nme" )

echo "== 2/3  파이썬 실행기 wasm 빌드 =="
# getrandom needs telling, per target, that the browser provides the entropy.
( cd crates/nme-run && flock -w 3600 /tmp/big-heavy.lock -c \
    "RUSTFLAGS='--cfg getrandom_backend=\"wasm_js\"' wasm-pack build --release --target web --out-dir ../../site/assets/wasm-run --out-name nmerun" )

rm -f site/assets/wasm/package.json site/assets/wasm-run/package.json \
      site/assets/wasm/*.d.ts site/assets/wasm-run/*.d.ts

echo "== 바닥글 판번호 =="
node scripts/check-site-version.mjs

echo "== 내려받기 진행률용 크기 기록 =="
node scripts/stamp-assets.mjs

echo "== 문서 안의 프로그램 전수 시험 =="
# The guides and prompts are written in the language repository and published
# from here, so this is the last place their code can be checked before it
# reaches a reader. Nothing else in this deploy compiles their ```nme blocks.
NME_REPO="${NME_REPO:-$HOME/nmt/needmoreeasy}"
if [ -d "$NME_REPO/scripts" ]; then
  ( cd "$NME_REPO" \
    && python3 scripts/check-guide-code.py \
    && python3 scripts/check-guide-output.py \
    && python3 scripts/check-guide-silent.py \
    && python3 scripts/check-guide-index.py )
else
  echo "  언어 저장소를 찾지 못해 건너뜁니다: $NME_REPO" >&2
  exit 1
fi

echo "== 가이드·문법·프롬프트 문서 페이지 생성 =="
python3 scripts/build-docs.py

echo "== 브라우저 스크립트 타입 검사·컴파일 =="
# The page's scripts are TypeScript in site/src/. A static host cannot compile
# anything, so it happens here — and the type check is part of the gate, before
# any of the checks below run against the compiled files.
node scripts/build-scripts.mjs

echo "== 첫 화면에 실린 프로그램 전수 시험 =="
node scripts/check-site-code.mjs

echo "== 예제 회귀 시험 =="
node scripts/check-examples.mjs

# The layout check needs a server with the same cross-origin headers Pages
# sends, so it starts one, checks every page at five widths in both themes,
# and stops it again. A layout that overflows a phone must not reach the web.
echo "== 내부 링크 전수 시험 =="
node scripts/check-site-links.mjs

echo "== 화면 폭·테마 회귀 시험 =="
node scripts/serve.mjs 8788 >/dev/null 2>&1 &
SERVE_PID=$!
trap 'kill "$SERVE_PID" 2>/dev/null || true' EXIT
sleep 1
# `set -e` does not watch a background job, so a preview server that never came
# up would leave the checks below failing for the wrong reason — or, worse,
# passing vacuously. Ask it for a page before trusting it.
curl -fsS -o /dev/null --max-time 10 http://127.0.0.1:8788/ || {
  echo "미리보기 서버가 뜨지 않았습니다" >&2
  exit 1
}
node scripts/check-site-layout.mjs http://127.0.0.1:8788
node scripts/check-site-playground.mjs http://127.0.0.1:8788
node scripts/check-site-structure.mjs http://127.0.0.1:8788
# What a visitor sees when a download never arrives, and when the engine is
# slow — the two paths that are invisible until they go wrong.
node scripts/check-site-boot-failures.mjs http://127.0.0.1:8788
node scripts/check-site-slow-engine.mjs http://127.0.0.1:8788
node scripts/check-site-docs.mjs http://127.0.0.1:8788
# The three files are a promise that nothing but the visitor writes to them.
node scripts/check-site-files.mjs http://127.0.0.1:8788
# A phone, driven by real taps, with the keyboard taking half the screen. The
# width sweep above cannot see any of that: it never touches and never types.
node scripts/check-site-mobile.mjs http://127.0.0.1:8788
kill "$SERVE_PID" 2>/dev/null || true
trap - EXIT

echo "== 3/3  Cloudflare Pages 배포 =="
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a
export CLOUDFLARE_EMAIL CLOUDFLARE_API_KEY
export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"
npx --yes wrangler@4 pages deploy site --project-name "$PROJECT" --branch main --commit-dirty=true

echo "== 가장자리 캐시 비우기 =="
# Pages serves each deployment immediately, but Cloudflare's edge may still be
# holding the previous copy of an asset; without this a fixed stylesheet can
# stay invisible for as long as its cache lifetime.
curl -sS -X POST "https://api.cloudflare.com/client/v4/zones/CLOUDFLARE_ZONE_ID_WAS_HERE/purge_cache" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" -H "X-Auth-Key: ${CLOUDFLARE_API_KEY}" \
  -H "Content-Type: application/json" --data '{"purge_everything":true}' \
  -o /dev/null -w "  purge -> HTTP %{http_code}\n"

echo "== 외부에서 실제 확인 =="
for url in https://needmoreeasy.com/ https://needmoreeasy.com/ko/ https://www.needmoreeasy.com/; do
  code=$(curl -sS -o /dev/null --max-time 40 --retry 4 --retry-delay 5 --retry-all-errors -w '%{http_code}' "$url")
  echo "  $url -> $code"
  [ "$code" = "200" ] || { echo "배포 후 확인 실패: $url" >&2; exit 1; }
done
echo "== 배포된 사이트를 밖에서 열어 확인 =="
node scripts/check-live.mjs https://needmoreeasy.com

echo "배포 완료."
