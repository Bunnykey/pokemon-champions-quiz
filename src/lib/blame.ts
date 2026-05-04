import type { Question } from '../types/quiz'

const DEFAULT_REPO = 'Bunnykey/pokemon-champions-quiz'

export function buildBlameIssueUrl(
  question: Question,
  note: string,
  repo = DEFAULT_REPO,
) {
  const title = `[quiz-blame] ${question.id}`
  const body = [
    '## Problem',
    `- ID: ${question.id}`,
    `- Difficulty: ${question.difficulty}`,
    `- Tags: ${question.tags.join(', ')}`,
    '',
    '## Prompt',
    question.promptKo,
    '',
    '## Choices',
    ...question.choices.map((choice, index) => {
      const marker = index === question.answerIndex ? ' [answer]' : ''
      return `${index + 1}. ${choice}${marker}`
    }),
    '',
    '## Explanation',
    question.explanationKo,
    '',
    '## Sources',
    ...question.sourceRefs.map(
      (source) => `- ${source.kind}: ${source.label} ${source.url}`,
    ),
    '',
    '## User note',
    note.trim() || '(empty)',
  ].join('\n')

  const params = new URLSearchParams({
    title,
    body,
    labels: 'quiz-blame',
  })

  return `https://github.com/${repo}/issues/new?${params.toString()}`
}
