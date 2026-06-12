import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import questions from './data/questions.json'
import { shuffleQuestions } from './lib/questions'

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('starts a quiz, answers, shows explanation, and exposes blame URL', async () => {
    const user = userEvent.setup()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const firstIntroQuestion = shuffleQuestions(
      questions.filter((question) => question.difficulty === '입문'),
      () => 0,
    )[0]
    render(<App />)

    expect(screen.getByText('Pokémon Champions 실전 퀴즈')).toBeInTheDocument()
    expect(
      screen.getByText(questions.length.toLocaleString('ko-KR')),
    ).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /시작/ })[0])
    expect(firstIntroQuestion?.focusPokemon).toBeDefined()
    expect(screen.getByText(firstIntroQuestion.promptKo)).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: `${firstIntroQuestion?.focusPokemon?.nameKo} (${firstIntroQuestion?.focusPokemon?.nameEn})`,
      }),
    ).toBeInTheDocument()
    const choices = screen.getAllByTestId('answer-choice')
    expect(choices).toHaveLength(4)

    await user.click(choices[0])

    expect(screen.getByTestId('result-status')).toHaveTextContent(/정답|오답/)
    expect(
      screen.getByRole('link', { name: /PokeAPI Pokemon:/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/GitHub Issue로 신고/)).toBeInTheDocument()
    expect(screen.getByTestId('blame-link')).toHaveAttribute(
      'href',
      expect.stringContaining('/Bunnykey/pokemon-champions-quiz/issues/new?'),
    )
  })

  it('supports keyboard answering and next-question navigation', async () => {
    const user = userEvent.setup()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const introQuestions = questions.filter(
      (question) => question.difficulty === '입문',
    )
    const shuffledIntroQuestions = shuffleQuestions(introQuestions, () => 0)
    const expectedFirstQuestion = shuffledIntroQuestions[0]
    const expectedSecondQuestion = shuffledIntroQuestions[1]
    render(<App />)

    await user.click(screen.getAllByRole('button', { name: /시작/ })[0])
    await user.keyboard(String(expectedFirstQuestion.answerIndex + 1))

    expect(screen.getByTestId('result-status')).toHaveTextContent('정답')

    await user.keyboard('{Enter}')

    expect(screen.getByTestId('result-status')).toHaveTextContent('선택 대기')
    expect(screen.getByText(expectedSecondQuestion.promptKo)).toBeInTheDocument()
  })

  it('marks unanswered quiz questions incorrect when the countdown expires', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    })
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const firstIntroQuestion = shuffleQuestions(
      questions.filter((question) => question.difficulty === '입문'),
      () => 0,
    )[0]
    render(<App />)

    const startQuiz = user.click(screen.getAllByRole('button', { name: /시작/ })[0])
    await vi.advanceTimersByTimeAsync(0)
    await startQuiz

    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(screen.getByTestId('result-status')).toHaveTextContent('오답')
    expect(screen.getByText(firstIntroQuestion.explanationKo)).toBeInTheDocument()
    expect(
      window.localStorage.getItem('pokemon-champions-quiz-progress-v1'),
    ).toContain(firstIntroQuestion.id)

    vi.useRealTimers()
  })

  it('moves keyboard focus through interactive controls', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.tab()
    expect(document.activeElement).not.toBe(document.body)
    expect(document.activeElement).toBe(
      screen.getByRole('link', { name: '본문으로 건너뛰기' }),
    )

    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /홈/ }))

    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: /퀴즈/ }),
    )
    expect(['A', 'BUTTON']).toContain(
      (document.activeElement as HTMLElement).tagName,
    )
  })

  it('shows service policy controls and can reset local progress', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)

    await user.click(screen.getAllByRole('button', { name: /시작/ })[0])
    await user.click(screen.getAllByTestId('answer-choice')[0])
    await user.click(screen.getByRole('button', { name: /서비스/ }))

    expect(screen.getByText('공개 웹 서비스 기본 항목')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /기록 내보내기/ })).toHaveAttribute(
      'download',
      'pokemon-champions-quiz-progress.json',
    )

    await user.click(screen.getByRole('button', { name: /기록 초기화/ }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(
      window.localStorage.getItem('pokemon-champions-quiz-progress-v1'),
    ).toContain('"answered":[]')
    confirmSpy.mockRestore()
  })
})
