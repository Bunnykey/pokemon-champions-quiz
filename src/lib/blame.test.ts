import { describe, expect, it } from 'vitest'
import { buildBlameIssueUrl } from './blame'
import { questions } from './questions'

describe('buildBlameIssueUrl', () => {
  it('creates a GitHub issue URL with the question payload', () => {
    const question = questions[0]
    const url = new URL(buildBlameIssueUrl(question, '정답이 이상합니다.'))

    expect(url.origin).toBe('https://github.com')
    expect(url.pathname).toBe('/Bunnykey/pokemon-champions-quiz/issues/new')
    expect(url.searchParams.get('title')).toBe(`[quiz-blame] ${question.id}`)
    expect(url.searchParams.get('labels')).toBe('quiz-blame')
    expect(url.searchParams.get('body')).toContain(question.promptKo)
    expect(url.searchParams.get('body')).toContain('정답이 이상합니다.')
  })
})
