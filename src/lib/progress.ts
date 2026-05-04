import type { AnswerRecord, ProgressState } from '../types/quiz'

const STORAGE_KEY = 'pokemon-champions-quiz-progress-v1'

const EMPTY_PROGRESS: ProgressState = {
  answered: [],
  missedQuestionIds: [],
}

export function emptyProgress(): ProgressState {
  return {
    answered: [],
    missedQuestionIds: [],
  }
}

export function loadProgress(storage: Storage = window.localStorage): ProgressState {
  const value = storage.getItem(STORAGE_KEY)
  if (!value) {
    return EMPTY_PROGRESS
  }

  try {
    const parsed = JSON.parse(value) as ProgressState
    return {
      answered: Array.isArray(parsed.answered) ? parsed.answered : [],
      missedQuestionIds: Array.isArray(parsed.missedQuestionIds)
        ? parsed.missedQuestionIds
        : [],
    }
  } catch {
    return EMPTY_PROGRESS
  }
}

export function clearStoredProgress(storage: Storage = window.localStorage) {
  storage.removeItem(STORAGE_KEY)
}

export function saveProgress(
  progress: ProgressState,
  storage: Storage = window.localStorage,
) {
  storage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function recordAnswer(
  progress: ProgressState,
  record: AnswerRecord,
): ProgressState {
  const missed = new Set(progress.missedQuestionIds)
  if (record.correct) {
    missed.delete(record.questionId)
  } else {
    missed.add(record.questionId)
  }

  return {
    answered: [...progress.answered, record].slice(-600),
    missedQuestionIds: Array.from(missed),
  }
}

export function removeMiss(progress: ProgressState, questionId: string) {
  return {
    ...progress,
    missedQuestionIds: progress.missedQuestionIds.filter((id) => id !== questionId),
  }
}

export function getAccuracy(progress: ProgressState) {
  if (progress.answered.length === 0) {
    return 0
  }
  const correct = progress.answered.filter((record) => record.correct).length
  return Math.round((correct / progress.answered.length) * 100)
}
