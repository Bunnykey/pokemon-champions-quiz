import { describe, expect, it } from 'vitest'
import { getAccuracy, recordAnswer, removeMiss } from './progress'
import type { ProgressState } from '../types/quiz'

describe('progress helpers', () => {
  it('records misses, removes them after correct answers, and computes accuracy', () => {
    const empty: ProgressState = { answered: [], missedQuestionIds: [] }
    const missed = recordAnswer(empty, {
      questionId: 'q-1',
      selectedIndex: 0,
      correct: false,
      answeredAt: '2026-05-04T00:00:00.000Z',
    })
    const corrected = recordAnswer(missed, {
      questionId: 'q-1',
      selectedIndex: 1,
      correct: true,
      answeredAt: '2026-05-04T00:01:00.000Z',
    })

    expect(missed.missedQuestionIds).toEqual(['q-1'])
    expect(corrected.missedQuestionIds).toEqual([])
    expect(getAccuracy(corrected)).toBe(50)
    expect(removeMiss(missed, 'q-1').missedQuestionIds).toEqual([])
  })
})
