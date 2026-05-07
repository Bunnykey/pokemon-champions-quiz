# Pokémon Champions Quiz

Regulation Set M-A 기준 실전 퀴즈 웹앱입니다. 정적 GitHub Pages 배포를 전제로 하며, 서버가 없기 때문에 문제 신고는 GitHub Issues prefilled URL로 처리합니다.

## Commands

```bash
npm install
npm run generate:questions
npm run dev
npm run test
npm run build
npm run validate:questions
```

`npm run build`는 GitHub Pages 경로 `/pokemon-champions-quiz/`를 base path로 사용합니다.

## Data

- `scripts/generate-questions.mjs`가 공식 Regulation Set M-A 페이지와 참가 가능 포켓몬 en/ko 페이지를 읽습니다.
- `src/data/questions.json`은 생성된 정적 문제은행입니다. 현재 2,066문항입니다.
- 타입, 스탯, 특성 데이터는 `@pkmn/dex`를 사용합니다.
- 기준 확인일은 2026-05-08입니다.
- 전문가 난이도에는 시즌 시작/종료 시각, UTC 일정, 반복 복습 문항을 허용하지 않습니다.
- 전문가 난이도는 `실전판단`과 상성/교체/스피드/카운터/압박 계열 태그가 있어야 검증을 통과합니다.
- 난이도별 생성 템플릿 범위와 평균 복잡도 점수가 입문에서 전문가까지 상승하는지 검증합니다.
- 퀴즈 시작 시 난이도별 문제 순서를 셔플하고, 한 바퀴를 마치면 다시 셔플합니다.
- 지문에 특정 포켓몬이 등장하는 문항은 PokeAPI 이미지와 개별 Pokémon 레퍼런스를 포함합니다.
- 비규정 문항은 PokeAPI Pokémon/Type 또는 Pokémon Showdown Dex의 문제별 URL이 있어야 검증을 통과합니다.

## Design System: Champion Stadium

- Official Pokémon 로고나 번들 이미지를 포함하지 않습니다. 포켓몬 이미지는 PokeAPI의 외부 도감 이미지 URL을 런타임에 참조합니다.
- 색상: `champion-red`, `signal-yellow`, `stadium-blue`, `ink`, `paper`.
- UI 모티프: 경기장 전광판 카드, 타입 배지, 난이도 칩, 굵은 외곽선, Poké Ball에서 착안한 M-A 규정 배지.
- 컴포넌트: difficulty chip, regulation badge, battle card, answer button, blame button, progress meter.

## Blame Flow

각 문제의 신고 버튼은 `Bunnykey/pokemon-champions-quiz`에 새 GitHub Issue를 여는 URL을 만듭니다. 본문에는 문제 ID, 난이도, 태그, 지문, 선택지, 정답, 해설, 출처, 사용자 메모가 포함됩니다.

## Web Service Baseline

- SEO/social metadata: canonical URL, Open Graph, Twitter card, JSON-LD.
- Discoverability: `robots.txt`, `sitemap.xml`, GitHub Pages `404.html`.
- PWA: web app manifest and a small service worker for static shell caching.
- Privacy: no accounts, cookies, analytics, or server-side tracking.
- Data portability: local progress can be exported as JSON or reset from the service screen.
- Accessibility: skip link, keyboard answering (`1`-`4`), next shortcut (`Enter` or `N`), visible focus rings, and live result status.
- Resilience: React error boundary with reload fallback.
