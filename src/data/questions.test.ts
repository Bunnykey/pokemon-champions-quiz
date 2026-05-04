import { describe, expect, it } from 'vitest'
import { DIFFICULTIES, REGULATION_MA } from './regulation'
import questions from './questions.json'
import type { Question } from '../types/quiz'

const typedQuestions = questions as Question[]

describe('generated question bank', () => {
  it('contains more than 1000 valid questions across every difficulty', () => {
    expect(typedQuestions.length).toBeGreaterThanOrEqual(1000)

    for (const difficulty of DIFFICULTIES) {
      expect(
        typedQuestions.filter((question) => question.difficulty === difficulty)
          .length,
      ).toBeGreaterThan(0)
    }
  })

  it('keeps ids unique and answer indexes valid', () => {
    const ids = new Set(typedQuestions.map((question) => question.id))
    expect(ids.size).toBe(typedQuestions.length)

    for (const question of typedQuestions) {
      expect(question.choices).toHaveLength(4)
      expect(question.answerIndex).toBeGreaterThanOrEqual(0)
      expect(question.answerIndex).toBeLessThan(4)
      expect(new Set(question.choices).size).toBe(4)
      expect(question.promptKo.length).toBeGreaterThan(0)
      expect(question.explanationKo.length).toBeGreaterThan(0)
    }
  })

  it('anchors official regulation questions to Regulation Set M-A', () => {
    const officialRefs = typedQuestions.flatMap((question) =>
      question.sourceRefs.filter((source) => source.kind === 'official-regulation'),
    )
    expect(officialRefs.length).toBeGreaterThan(0)

    for (const source of officialRefs) {
      expect(source.label).toBe('Regulation Set M-A')
      expect(source.url).toBe(REGULATION_MA.officialRegulationUrl)
    }
  })
})
