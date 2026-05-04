import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts a quiz, answers, shows explanation, and exposes blame URL', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText('Pokémon Champions 실전 퀴즈')).toBeInTheDocument()
    expect(screen.getByText('1,711')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /시작/ })[0])
    const choices = screen.getAllByTestId('answer-choice')
    expect(choices).toHaveLength(4)

    await user.click(choices[0])

    expect(screen.getByTestId('result-status')).toHaveTextContent(/정답|오답/)
    expect(screen.getByText(/GitHub Issue로 신고/)).toBeInTheDocument()
    expect(screen.getByTestId('blame-link')).toHaveAttribute(
      'href',
      expect.stringContaining('/Bunnykey/pokemon-champions-quiz/issues/new?'),
    )
  })

  it('supports keyboard answering and next-question navigation', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getAllByRole('button', { name: /시작/ })[0])
    await user.keyboard('2')

    expect(screen.getByTestId('result-status')).toHaveTextContent('정답')

    await user.keyboard('{Enter}')

    expect(screen.getByTestId('result-status')).toHaveTextContent('선택 대기')
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
