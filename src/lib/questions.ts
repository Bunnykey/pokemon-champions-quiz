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

export function getShuffledQuestionsForDifficulty(difficulty: Difficulty) {
  return shuffleQuestions(getQuestionsForDifficulty(difficulty))
}

export function shuffleQuestions<T>(items: readonly T[], random = Math.random) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ]
  }
  return shuffled
}

export function getQuestionTags() {
  return Array.from(new Set(questions.flatMap((question) => question.tags))).sort()
}
