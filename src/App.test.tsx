import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
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
})
