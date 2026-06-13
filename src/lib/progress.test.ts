import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAccuracy, recordAnswer, removeMiss } from './progress'
import type { ProgressState } from '../types/quiz'

describe('progress helpers', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('records misses, removes them after correct answers, and computes accuracy', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 4, 9))
    const empty: ProgressState = { answered: [], missedQuestionIds: [] }
    const missed = recordAnswer(empty, {
      questionId: 'q-1',
      selectedIndex: 0,
      correct: false,
    })
    const corrected = recordAnswer(missed, {
      questionId: 'q-1',
      selectedIndex: 1,
      correct: true,
      answeredAt: 123,
    })

    expect(missed.missedQuestionIds).toEqual(['q-1'])
    expect(missed.answered[0].answeredAt).toBe(new Date(2026, 4, 4, 9).getTime())
    expect(corrected.missedQuestionIds).toEqual([])
    expect(corrected.answered[1].answeredAt).toBe(123)
    expect(getAccuracy(corrected)).toBe(50)
    expect(removeMiss(missed, 'q-1').missedQuestionIds).toEqual([])
  })
})
