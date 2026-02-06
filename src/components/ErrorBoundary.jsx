import React from 'react'
import './styles/error-boundary.css'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Что-то пошло не так</h2>
          <p>Произошла ошибка при загрузке приложения.</p>
          <button onClick={() => window.location.reload()}>
            Обновить страницу
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
