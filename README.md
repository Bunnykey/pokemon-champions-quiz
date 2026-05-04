# Pokémon Champions Quiz

Regulation Set M-A 기준 실전 퀴즈 웹앱입니다. 정적 GitHub Pages 배포를 전제로 하며, 서버가 없기 때문에 문제 신고는 GitHub Issues prefilled URL로 처리합니다.

## Commands

```bash
npm install
npm run generate:questions
npm run dev
npm run test
npm run build
```

`npm run build`는 GitHub Pages 경로 `/pokemon-champions-quiz/`를 base path로 사용합니다.

## Data

- `scripts/generate-questions.mjs`가 공식 Regulation Set M-A 페이지와 참가 가능 포켓몬 en/ko 페이지를 읽습니다.
- `src/data/questions.json`은 생성된 정적 문제은행입니다. 현재 1,711문항입니다.
- 타입, 스탯, 특성 데이터는 `@pkmn/dex`를 사용합니다.
- 기준 확인일은 2026-05-04입니다.

## Design System: Champion Stadium

- Official Pokémon 로고, 일러스트, 스프라이트를 사용하지 않습니다.
- 색상: `champion-red`, `signal-yellow`, `stadium-blue`, `ink`, `paper`.
- UI 모티프: 경기장 전광판 카드, 타입 배지, 난이도 칩, 굵은 외곽선, Poké Ball에서 착안한 M-A 규정 배지.
- 컴포넌트: difficulty chip, regulation badge, battle card, answer button, blame button, progress meter.

## Blame Flow

각 문제의 신고 버튼은 `Bunnykey/pokemon-champions-quiz`에 새 GitHub Issue를 여는 URL을 만듭니다. 본문에는 문제 ID, 난이도, 태그, 지문, 선택지, 정답, 해설, 출처, 사용자 메모가 포함됩니다.
