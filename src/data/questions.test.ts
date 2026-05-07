import { describe, expect, it } from 'vitest'
import { DIFFICULTIES, REGULATION_MA } from './regulation'
import questions from './questions.json'
import { shuffleQuestions } from '../lib/questions'
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

  it('can shuffle question order without mutating the source bank', () => {
    const introQuestions = typedQuestions.filter(
      (question) => question.difficulty === '입문',
    )
    const shuffled = shuffleQuestions(introQuestions, () => 0)

    expect(shuffled).toHaveLength(introQuestions.length)
    expect(shuffled.map((question) => question.id).sort()).toEqual(
      introQuestions.map((question) => question.id).sort(),
    )
    expect(shuffled[0].id).not.toBe(introQuestions[0].id)
    expect(typedQuestions[0].id).toBe(questions[0].id)
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
    for (const question of typedQuestions.filter(
      (candidate) => candidate.difficulty === '전문가',
    )) {
      expect(question.generatedFrom).not.toMatch(/^official-regulation/)
      expect(question.tags).toContain('실전판단')
      expect(question.tags).toContain('복합판단')
      expect(
        question.tags.includes('카운터') || question.tags.includes('압박'),
      ).toBe(true)
      expect(question.tags).not.toContain('타이머')
      expect(question.tags).not.toContain('시즌')
    }
  })

  it('keeps the difficulty hierarchy ordered by template complexity', () => {
    const allowedGeneratedFromByDifficulty: Record<string, Set<string>> = {
      입문: new Set([
        'official-eligible-list + pkmn-dex:type-identity',
        'official-eligible-list:eligible-pick',
        'official-regulation:rule-0',
        'official-regulation:rule-1',
      ]),
      초급: new Set([
        'official-eligible-list + pkmn-dex:type-identity',
        'official-eligible-list:eligible-pick',
        'official-eligible-list:ineligible-trap',
        'official-regulation:mega-allowed',
        'official-regulation:rule-2',
        'official-regulation:rule-3',
        'official-regulation:rule-5',
        'pkmn-dex:type-chart-stab',
      ]),
      중급: new Set([
        'official-eligible-list:ineligible-trap',
        'official-regulation:mega-allowed',
        'official-regulation:mega-trap',
        'official-regulation:rule-4',
        'pkmn-dex:ability-recognition',
        'pkmn-dex:base-speed-fastest',
        'pkmn-dex:type-chart-stab',
        'pkmn-dex:type-chart-weakness',
      ]),
      상급: new Set([
        'official-regulation:mega-trap',
        'pkmn-dex:ability-recognition',
        'pkmn-dex:base-speed-benchmark',
        'pkmn-dex:base-speed-fastest',
        'pkmn-dex:type-chart-resistance',
        'pkmn-dex:type-chart-weakness',
      ]),
      전문가: new Set([
        'pkmn-dex:speed-pressure',
        'pkmn-dex:type-chart-counter-pivot',
      ]),
    }

    for (const question of typedQuestions) {
      expect(
        allowedGeneratedFromByDifficulty[question.difficulty].has(
          question.generatedFrom,
        ),
      ).toBe(true)
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
