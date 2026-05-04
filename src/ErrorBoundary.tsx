import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error boundary caught an error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-error">
          <h1>앱을 불러오지 못했습니다.</h1>
          <p>
            일시적인 브라우저 상태 문제일 수 있습니다. 새로고침 후에도 반복되면
            GitHub Issues로 알려주세요.
          </p>
          <button type="button" onClick={() => window.location.reload()}>
            새로고침
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
