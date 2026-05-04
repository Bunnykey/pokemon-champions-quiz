import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Flag,
  RotateCcw,
  ShieldCheck,
  Swords,
  TimerReset,
  Trophy,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  DIFFICULTIES,
  DIFFICULTY_DESCRIPTIONS,
  REGULATION_MA,
} from './data/regulation'
import validationSummary from './data/validation-summary.json'
import { buildBlameIssueUrl } from './lib/blame'
import {
  getAccuracy,
  loadProgress,
  recordAnswer,
  removeMiss,
  saveProgress,
} from './lib/progress'
import {
  difficultyQuestionCounts,
  getQuestionsForDifficulty,
  getQuestionTags,
  questions,
  questionsById,
} from './lib/questions'
import type { Difficulty, ProgressState, Question } from './types/quiz'

type ViewMode = 'home' | 'quiz' | 'review'
type ReviewDifficulty = '전체' | Difficulty

function App() {
  const [view, setView] = useState<ViewMode>('home')
  const [difficulty, setDifficulty] = useState<Difficulty>('입문')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [blameNote, setBlameNote] = useState('')
  const [reviewDifficulty, setReviewDifficulty] =
    useState<ReviewDifficulty>('전체')
  const [reviewTag, setReviewTag] = useState('전체')
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const activeQuestions = useMemo(
    () => getQuestionsForDifficulty(difficulty),
    [difficulty],
  )
  const currentQuestion = activeQuestions[questionIndex % activeQuestions.length]
  const reviewTags = useMemo(() => getQuestionTags(), [])
  const missedQuestions = useMemo(
    () =>
      progress.missedQuestionIds
        .map((id) => questionsById.get(id))
        .filter((question): question is Question => Boolean(question))
        .filter(
          (question) =>
            reviewDifficulty === '전체' ||
            question.difficulty === reviewDifficulty,
        )
        .filter(
          (question) => reviewTag === '전체' || question.tags.includes(reviewTag),
        ),
    [progress.missedQuestionIds, reviewDifficulty, reviewTag],
  )

  const accuracy = getAccuracy(progress)
  const answeredCount = progress.answered.length

  function startQuiz(nextDifficulty: Difficulty) {
    setDifficulty(nextDifficulty)
    setQuestionIndex(0)
    setSelectedIndex(null)
    setBlameNote('')
    setView('quiz')
  }

  function answerQuestion(choiceIndex: number) {
    if (selectedIndex !== null || !currentQuestion) {
      return
    }
    const correct = choiceIndex === currentQuestion.answerIndex
    setSelectedIndex(choiceIndex)
    setProgress((current) =>
      recordAnswer(current, {
        questionId: currentQuestion.id,
        selectedIndex: choiceIndex,
        correct,
        answeredAt: new Date().toISOString(),
      }),
    )
  }

  function nextQuestion() {
    setQuestionIndex((current) => current + 1)
    setSelectedIndex(null)
    setBlameNote('')
  }

  function clearMiss(questionId: string) {
    setProgress((current) => removeMiss(current, questionId))
  }

  return (
    <main className="app-shell">
      <header className="stadium-header">
        <div>
          <p className="eyebrow">Champion Stadium Drill</p>
          <h1>Pokémon Champions 실전 퀴즈</h1>
          <p className="lead">
            Regulation Set M-A 기준으로 규정, 상성, 스피드, 메가진화 판단을
            반복 훈련합니다.
          </p>
        </div>
        <div className="score-panel" aria-label="학습 요약">
          <div>
            <strong>{questions.length.toLocaleString('ko-KR')}</strong>
            <span>문제은행</span>
          </div>
          <div>
            <strong>{answeredCount.toLocaleString('ko-KR')}</strong>
            <span>풀이 기록</span>
          </div>
          <div>
            <strong>{accuracy}%</strong>
            <span>정답률</span>
          </div>
        </div>
      </header>

      <nav className="mode-bar" aria-label="앱 보기">
        <button
          className={view === 'home' ? 'mode-button active' : 'mode-button'}
          type="button"
          onClick={() => setView('home')}
        >
          <Trophy size={18} /> 홈
        </button>
        <button
          className={view === 'quiz' ? 'mode-button active' : 'mode-button'}
          type="button"
          onClick={() => setView('quiz')}
        >
          <Swords size={18} /> 퀴즈
        </button>
        <button
          className={view === 'review' ? 'mode-button active' : 'mode-button'}
          type="button"
          onClick={() => setView('review')}
        >
          <BookOpen size={18} /> 오답노트
        </button>
      </nav>

      {view === 'home' && (
        <HomeView
          answeredCount={answeredCount}
          accuracy={accuracy}
          progress={progress}
          onStart={startQuiz}
          onOpenReview={() => setView('review')}
        />
      )}

      {view === 'quiz' && currentQuestion && (
        <QuizView
          question={currentQuestion}
          questionIndex={questionIndex}
          totalQuestions={activeQuestions.length}
          selectedIndex={selectedIndex}
          blameNote={blameNote}
          onAnswer={answerQuestion}
          onNext={nextQuestion}
          onBlameNoteChange={setBlameNote}
        />
      )}

      {view === 'review' && (
        <ReviewView
          missedQuestions={missedQuestions}
          reviewDifficulty={reviewDifficulty}
          reviewTag={reviewTag}
          reviewTags={reviewTags}
          onDifficultyChange={setReviewDifficulty}
          onTagChange={setReviewTag}
          onClearMiss={clearMiss}
        />
      )}
    </main>
  )
}

interface HomeViewProps {
  answeredCount: number
  accuracy: number
  progress: ProgressState
  onStart: (difficulty: Difficulty) => void
  onOpenReview: () => void
}

function HomeView({
  answeredCount,
  accuracy,
  progress,
  onStart,
  onOpenReview,
}: HomeViewProps) {
  return (
    <>
      <section className="regulation-band" aria-labelledby="regulation-title">
        <div>
          <span className="regulation-badge">M-A</span>
          <h2 id="regulation-title">{REGULATION_MA.labelKo}</h2>
          <p>{REGULATION_MA.scheduleKo}</p>
        </div>
        <ul>
          {REGULATION_MA.formatNotesKo.map((note) => (
            <li key={note}>
              <ShieldCheck size={16} />
              {note}
            </li>
          ))}
        </ul>
      </section>

      <section className="validation-band" aria-label="문제은행 검증 상태">
        <div>
          <span className="validation-mark">
            <CheckCircle2 size={18} /> 검증 통과
          </span>
          <h2>문제은행 검증 상태</h2>
          <p>
            {validationSummary.totalQuestions.toLocaleString('ko-KR')}문항 전체를
            규칙별로 재계산했고, 타입 데이터는 PokéAPI와{' '}
            {validationSummary.pokeApiTypeCrossCheck.verified}/
            {validationSummary.officialEligiblePokemon} 교차검증했습니다.
          </p>
        </div>
        <div className="validation-metrics">
          <span>이슈 {validationSummary.checks.issues}</span>
          <span>공식 eligible {validationSummary.officialEligiblePokemon}</span>
          <span>허용 메가 {validationSummary.officialAllowedMegaEvolutions}</span>
        </div>
      </section>

      <section className="difficulty-grid" aria-label="난이도 선택">
        {DIFFICULTIES.map((difficulty) => {
          const stats = getDifficultyStats(progress, difficulty)
          return (
            <article className="difficulty-card" key={difficulty}>
              <div className="difficulty-card-top">
                <span className={`difficulty-chip ${difficultyClass(difficulty)}`}>
                  {difficulty}
                </span>
                <span>{difficultyQuestionCounts[difficulty]}문항</span>
              </div>
              <h3>{DIFFICULTY_DESCRIPTIONS[difficulty]}</h3>
              <ProgressMeter
                label={`${difficulty} 정답률`}
                value={stats.accuracy}
              />
              <p>
                풀이 {stats.answered}회 · 정답 {stats.correct}회
              </p>
              <button
                className="primary-action"
                type="button"
                onClick={() => onStart(difficulty)}
              >
                <Swords size={18} /> 시작
              </button>
            </article>
          )
        })}
      </section>

      <section className="training-summary">
        <div>
          <h2>오늘의 훈련 상태</h2>
          <p>
            누적 {answeredCount}회 풀이, 전체 정답률 {accuracy}%입니다.
          </p>
        </div>
        <button className="secondary-action" type="button" onClick={onOpenReview}>
          <BookOpen size={18} /> 오답 {progress.missedQuestionIds.length}개 복습
        </button>
      </section>
    </>
  )
}

interface QuizViewProps {
  question: Question
  questionIndex: number
  totalQuestions: number
  selectedIndex: number | null
  blameNote: string
  onAnswer: (choiceIndex: number) => void
  onNext: () => void
  onBlameNoteChange: (note: string) => void
}

function QuizView({
  question,
  questionIndex,
  totalQuestions,
  selectedIndex,
  blameNote,
  onAnswer,
  onNext,
  onBlameNoteChange,
}: QuizViewProps) {
  const answered = selectedIndex !== null
  const correct = selectedIndex === question.answerIndex
  const blameUrl = buildBlameIssueUrl(question, blameNote)

  return (
    <section className="quiz-layout" aria-label="퀴즈">
      <article className="battle-card quiz-card">
        <div className="question-meta">
          <span className={`difficulty-chip ${difficultyClass(question.difficulty)}`}>
            {question.difficulty}
          </span>
          <span>
            {questionIndex + 1} / {totalQuestions}
          </span>
        </div>
        <ProgressMeter
          label="현재 난이도 진행률"
          value={Math.round(((questionIndex + 1) / totalQuestions) * 100)}
        />
        <h2>{question.promptKo}</h2>
        <div className="answer-grid">
          {question.choices.map((choice, index) => {
            const stateClass = getChoiceState(question, selectedIndex, index)
            return (
              <button
                className={`answer-button ${stateClass}`}
                data-testid="answer-choice"
                disabled={answered}
                key={choice}
                type="button"
                onClick={() => onAnswer(index)}
              >
                <span>{index + 1}</span>
                {choice}
              </button>
            )
          })}
        </div>
      </article>

      <aside className="battle-card explanation-card">
        <div
          className={answered && correct ? 'result good' : 'result'}
          data-testid="result-status"
        >
          {answered ? (
            correct ? (
              <>
                <CheckCircle2 size={22} /> 정답
              </>
            ) : (
              <>
                <XCircle size={22} /> 오답
              </>
            )
          ) : (
            <>
              <TimerReset size={22} /> 선택 대기
            </>
          )}
        </div>

        {answered ? (
          <>
            <p className="explanation">{question.explanationKo}</p>
            <div className="tag-row">
              {question.tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="source-list">
              {question.sourceRefs.map((source) => (
                <a
                  href={source.url}
                  key={`${source.kind}-${source.url}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={14} /> {source.label}
                </a>
              ))}
            </div>
            <label className="blame-box">
              <span>
                <Flag size={16} /> Blame 신고 메모
              </span>
              <textarea
                value={blameNote}
                onChange={(event) => onBlameNoteChange(event.target.value)}
                placeholder="문제 내용, 정답, 번역, 출처 오류를 적어주세요."
              />
            </label>
            <div className="explanation-actions">
              <a
                className="blame-action"
                data-testid="blame-link"
                href={blameUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Flag size={18} /> GitHub Issue로 신고
              </a>
              <button className="primary-action" type="button" onClick={onNext}>
                다음 문제
              </button>
            </div>
          </>
        ) : (
          <p className="explanation muted">
            답을 선택하면 해설, 근거 링크, 신고 버튼이 표시됩니다.
          </p>
        )}
      </aside>
    </section>
  )
}

interface ReviewViewProps {
  missedQuestions: Question[]
  reviewDifficulty: ReviewDifficulty
  reviewTag: string
  reviewTags: string[]
  onDifficultyChange: (difficulty: ReviewDifficulty) => void
  onTagChange: (tag: string) => void
  onClearMiss: (questionId: string) => void
}

function ReviewView({
  missedQuestions,
  reviewDifficulty,
  reviewTag,
  reviewTags,
  onDifficultyChange,
  onTagChange,
  onClearMiss,
}: ReviewViewProps) {
  return (
    <section className="review-panel" aria-label="오답노트">
      <div className="review-toolbar">
        <div>
          <h2>오답노트</h2>
          <p>{missedQuestions.length}개 문제를 다시 확인합니다.</p>
        </div>
        <div className="filters">
          <select
            aria-label="난이도 필터"
            value={reviewDifficulty}
            onChange={(event) =>
              onDifficultyChange(event.target.value as ReviewDifficulty)
            }
          >
            <option value="전체">전체 난이도</option>
            {DIFFICULTIES.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
          <select
            aria-label="태그 필터"
            value={reviewTag}
            onChange={(event) => onTagChange(event.target.value)}
          >
            <option value="전체">전체 태그</option>
            {reviewTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {missedQuestions.length === 0 ? (
        <div className="empty-state">
          <CheckCircle2 size={28} />
          <h3>필터에 맞는 오답이 없습니다.</h3>
          <p>퀴즈에서 틀린 문제는 자동으로 여기에 모입니다.</p>
        </div>
      ) : (
        <div className="review-list">
          {missedQuestions.map((question) => (
            <article className="review-item" key={question.id}>
              <div>
                <span
                  className={`difficulty-chip ${difficultyClass(
                    question.difficulty,
                  )}`}
                >
                  {question.difficulty}
                </span>
                <h3>{question.promptKo}</h3>
                <p>{question.explanationKo}</p>
                <div className="tag-row">
                  {question.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="review-actions">
                <a
                  className="blame-action compact"
                  href={buildBlameIssueUrl(question, '')}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Flag size={16} /> 신고
                </a>
                <button
                  className="secondary-action compact"
                  type="button"
                  onClick={() => onClearMiss(question.id)}
                >
                  <RotateCcw size={16} /> 해제
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

interface ProgressMeterProps {
  label: string
  value: number
}

function ProgressMeter({ label, value }: ProgressMeterProps) {
  const safeValue = Math.max(0, Math.min(100, value))
  return (
    <div className="progress-meter" aria-label={label}>
      <div style={{ width: `${safeValue}%` }} />
    </div>
  )
}

function getDifficultyStats(progress: ProgressState, difficulty: Difficulty) {
  const records = progress.answered.filter(
    (record) => questionsById.get(record.questionId)?.difficulty === difficulty,
  )
  const correct = records.filter((record) => record.correct).length
  return {
    answered: records.length,
    correct,
    accuracy: records.length === 0 ? 0 : Math.round((correct / records.length) * 100),
  }
}

function getChoiceState(
  question: Question,
  selectedIndex: number | null,
  choiceIndex: number,
) {
  if (selectedIndex === null) {
    return ''
  }
  if (choiceIndex === question.answerIndex) {
    return 'correct'
  }
  if (choiceIndex === selectedIndex) {
    return 'wrong'
  }
  return 'dimmed'
}

function difficultyClass(difficulty: Difficulty) {
  return `difficulty-${DIFFICULTIES.indexOf(difficulty)}`
}

export default App
