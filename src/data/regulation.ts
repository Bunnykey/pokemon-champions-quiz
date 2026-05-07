import type { Difficulty } from '../types/quiz'

export const REGULATION_MA = {
  id: 'regulation-m-a',
  labelKo: 'Regulation Set M-A',
  scheduleKo: '2026-04-08 02:00 UTC부터 2026-06-17 01:59 UTC까지',
  retrievedAt: '2026-05-08',
  officialRegulationUrl:
    'https://champions-news.pokemon-home.com/en/page/751.html',
  officialEligibleListUrl:
    'https://web-view.app.pokemonchampions.jp/battle/pages/events/rs177501629259kmzbny/ko/pokemon.html',
  gameplayUrl: 'https://champions.pokemon.com/en-us/gameplay/',
  formatNotesKo: [
    'Ranked Battle 첫 규정 세트 기준입니다.',
    'Mega Evolution은 배틀당 1회만 사용할 수 있습니다.',
    '중복 도구는 허용되지 않습니다.',
    '총 시간 20분, 플레이어 시간 7분, 턴 시간 45초, 선출 시간 90초입니다.',
  ],
} as const

export const DIFFICULTIES: Difficulty[] = [
  '입문',
  '초급',
  '중급',
  '상급',
  '전문가',
]

export const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  입문: '규정, 타입, 기본 표기를 빠르게 익히는 단계',
  초급: '참가 가능 여부와 메가진화 규칙을 헷갈리지 않는 단계',
  중급: '상성, STAB, 스피드 비교를 실전 선택으로 연결하는 단계',
  상급: '교체, 선출, 복합 조건을 보고 안전한 선택지를 고르는 단계',
  전문가: '교체, 카운터, 스피드 압박을 복합 조건으로 판단하는 단계',
}

export const TYPE_LABELS: Record<string, string> = {
  Normal: '노말',
  Fire: '불꽃',
  Water: '물',
  Electric: '전기',
  Grass: '풀',
  Ice: '얼음',
  Fighting: '격투',
  Poison: '독',
  Ground: '땅',
  Flying: '비행',
  Psychic: '에스퍼',
  Bug: '벌레',
  Rock: '바위',
  Ghost: '고스트',
  Dragon: '드래곤',
  Dark: '악',
  Steel: '강철',
  Fairy: '페어리',
}

export function typeLabel(typeName: string) {
  return `${TYPE_LABELS[typeName] ?? typeName} (${typeName})`
}
