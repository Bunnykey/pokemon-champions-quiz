import { describe, expect, it } from 'vitest'
import { contrastRatio } from './contrast'

describe('contrastRatio', () => {
  it('returns the maximum contrast ratio for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21)
  })

  it('keeps body text and page background above WCAG AA contrast', () => {
    const ink = '#111827'
    const paper = '#fffdf7'

    expect(contrastRatio(ink, paper)).toBeGreaterThanOrEqual(4.5)
  })
})
