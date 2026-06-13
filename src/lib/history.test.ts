import { afterEach, describe, expect, it, vi } from 'vitest'
import { aggregateAccuracyByDay } from './history'
import type { ProgressState } from '../types/quiz'

const noon = (day: number) => new Date(2026, 5, day, 12).getTime()

describe('history helpers', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('aggregates dated answers into recent local-day accuracy buckets', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 13, 12))

    const progress: ProgressState = {
      answered: [
        {
          questionId: 'q-undated',
          selectedIndex: 0,
          correct: false,
        },
        {
          questionId: 'q-1',
          selectedIndex: 1,
          correct: true,
          answeredAt: noon(7),
        },
        {
          questionId: 'q-2',
          selectedIndex: 2,
          correct: false,
          answeredAt: noon(10),
        },
        {
          questionId: 'q-3',
          selectedIndex: 3,
          correct: true,
          answeredAt: noon(10),
        },
        {
          questionId: 'q-4',
          selectedIndex: 0,
          correct: true,
          answeredAt: noon(13),
        },
      ],
      missedQuestionIds: ['q-undated', 'q-2'],
    }

    const history = aggregateAccuracyByDay(progress, 7)

    expect(history).toEqual([
      { date: '2026-06-07', total: 1, correct: 1, accuracy: 1 },
      { date: '2026-06-08', total: 0, correct: 0, accuracy: 0 },
      { date: '2026-06-09', total: 0, correct: 0, accuracy: 0 },
      { date: '2026-06-10', total: 2, correct: 1, accuracy: 0.5 },
      { date: '2026-06-11', total: 0, correct: 0, accuracy: 0 },
      { date: '2026-06-12', total: 0, correct: 0, accuracy: 0 },
      { date: '2026-06-13', total: 1, correct: 1, accuracy: 1 },
    ])
  })
})
