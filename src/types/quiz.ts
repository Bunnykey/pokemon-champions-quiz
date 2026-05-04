export type Difficulty = '입문' | '초급' | '중급' | '상급' | '전문가'

export type SourceKind =
  | 'official-regulation'
  | 'official-eligible-list'
  | 'pokeapi'
  | 'pkmn-dex'
  | 'manual'

export interface SourceRef {
  kind: SourceKind
  label: string
  url: string
  retrievedAt?: string
}

export interface Question {
  id: string
  difficulty: Difficulty
  tags: string[]
  promptKo: string
  choices: string[]
  answerIndex: number
  explanationKo: string
  sourceRefs: SourceRef[]
  generatedFrom: string
}

export interface AnswerRecord {
  questionId: string
  selectedIndex: number
  correct: boolean
  answeredAt: string
}

export interface ProgressState {
  answered: AnswerRecord[]
  missedQuestionIds: string[]
}
