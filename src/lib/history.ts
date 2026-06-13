import type { ProgressState } from '../types/quiz'

export function aggregateAccuracyByDay(
  progress: ProgressState,
  days: number,
): { date: string; total: number; correct: number; accuracy: number }[] {
  if (days <= 0) {
    return []
  }

  const today = new Date()
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - days + 1,
  )
  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + index,
    )
    return {
      date: toLocalDateKey(date),
      total: 0,
      correct: 0,
      accuracy: 0,
    }
  })
  const bucketByDate = new Map(buckets.map((bucket) => [bucket.date, bucket]))

  for (const record of progress.answered) {
    if (typeof record.answeredAt !== 'number') {
      continue
    }

    const date = new Date(record.answeredAt)
    const bucket = bucketByDate.get(toLocalDateKey(date))
    if (!bucket) {
      continue
    }

    bucket.total += 1
    if (record.correct) {
      bucket.correct += 1
    }
  }

  return buckets.map((bucket) => ({
    ...bucket,
    accuracy: bucket.total === 0 ? 0 : bucket.correct / bucket.total,
  }))
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
