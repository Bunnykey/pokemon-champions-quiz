import { describe, expect, it } from 'vitest'
import {
  getQuestionsForDifficulty,
  getQuestionsForDifficultyAndTag,
} from './questions'
import type { Difficulty } from '../types/quiz'

describe('question filters', () => {
  const difficulty: Difficulty = '입문'
  const difficultyQuestions = getQuestionsForDifficulty(difficulty)
  const realTag = difficultyQuestions[0].tags[0]

  it('returns only questions for the requested difficulty and tag', () => {
    const taggedQuestions = getQuestionsForDifficultyAndTag(difficulty, realTag)

    expect(taggedQuestions.length).toBeGreaterThan(0)
    expect(taggedQuestions).toEqual(
      difficultyQuestions.filter((question) => question.tags.includes(realTag)),
    )
    expect(
      taggedQuestions.every(
        (question) =>
          question.difficulty === difficulty && question.tags.includes(realTag),
      ),
    ).toBe(true)
  })

  it("returns all questions for the requested difficulty when tag is '전체'", () => {
    expect(getQuestionsForDifficultyAndTag(difficulty, '전체')).toEqual(
      difficultyQuestions,
    )
  })

  it('returns an empty list when the requested tag does not exist', () => {
    expect(getQuestionsForDifficultyAndTag(difficulty, '없는태그')).toEqual([])
  })
})
