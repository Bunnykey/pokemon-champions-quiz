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
      expect(source.label).toContain('Regulation Set M-A')
      expect(source.url).toContain(REGULATION_MA.officialRegulationUrl)
    }
  })

  it('keeps non-practical recall out of the quiz copy', () => {
    const bannedPatterns = [
      /복습/,
      /Regulation Set M-A 시작 시각/,
      /Regulation Set M-A 종료 시각/,
      /\bUTC\b/,
      /20\d{2}-\d{2}-\d{2}/,
    ]

    for (const question of typedQuestions) {
      const teachableText = [
        question.promptKo,
        question.explanationKo,
        ...question.choices,
      ].join(' ')

      for (const pattern of bannedPatterns) {
        expect(teachableText).not.toMatch(pattern)
      }
    }
  })

  it('keeps expert questions practical instead of regulation trivia', () => {
    const expertDecisionTags = new Set([
      '상성',
      '교체',
      '카운터',
      '스피드',
      '스피드티어',
      '선공',
      '압박',
      '복합판단',
    ])

    for (const question of typedQuestions.filter(
      (candidate) => candidate.difficulty === '전문가',
    )) {
      expect(question.generatedFrom).not.toMatch(/^official-regulation/)
      expect(question.tags).toContain('실전판단')
      expect(question.tags.some((tag) => expertDecisionTags.has(tag))).toBe(true)
      expect(question.tags).not.toContain('타이머')
      expect(question.tags).not.toContain('시즌')
    }
  })

  it('uses question-specific references and focus Pokemon media when available', () => {
    let focusPokemonCount = 0
    const specificReferencePattern =
      /pokeapi\.co\/api\/v2\/(pokemon|type)\//i
    const dexReferencePattern = /dex\.pokemonshowdown\.com\/pokemon\//i

    for (const question of typedQuestions) {
      for (const source of question.sourceRefs) {
        expect(source.label.length).toBeGreaterThan(0)
        expect(source.url).toMatch(/^https?:\/\//)
      }

      if (!question.generatedFrom.startsWith('official-regulation')) {
        expect(
          question.sourceRefs.some(
            (source) =>
              specificReferencePattern.test(source.url) ||
              dexReferencePattern.test(source.url) ||
              source.label.includes('Regulation Set M-A:'),
          ),
        ).toBe(true)
      }

      if (question.focusPokemon) {
        focusPokemonCount += 1
        expect(question.focusPokemon.nameKo.length).toBeGreaterThan(0)
        expect(question.focusPokemon.nameEn.length).toBeGreaterThan(0)
        expect(question.focusPokemon.imageUrl).toMatch(/^https?:\/\//)
        expect(
          question.sourceRefs.some(
            (source) => source.url === question.focusPokemon?.referenceUrl,
          ),
        ).toBe(true)
      }
    }

    expect(focusPokemonCount).toBeGreaterThan(0)
  })
})
