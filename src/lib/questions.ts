import rawQuestions from '../data/questions.json'
import { DIFFICULTIES } from '../data/regulation'
import type { Difficulty, Question } from '../types/quiz'

export const questions = rawQuestions as Question[]

export const questionsById = new Map(questions.map((question) => [question.id, question]))

export const difficultyQuestionCounts = DIFFICULTIES.reduce(
  (counts, difficulty) => {
    counts[difficulty] = questions.filter(
      (question) => question.difficulty === difficulty,
    ).length
    return counts
  },
  {} as Record<Difficulty, number>,
)

export function getQuestionsForDifficulty(difficulty: Difficulty) {
  return questions.filter((question) => question.difficulty === difficulty)
}

export function getQuestionTags() {
  return Array.from(new Set(questions.flatMap((question) => question.tags))).sort()
}
