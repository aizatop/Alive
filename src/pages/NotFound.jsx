import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/not-found.css'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>Страница не найдена</h1>
        <p>К сожалению, страница, которую вы ищете, не существует или была удалена.</p>
        
        <div className="error-emoji">🗺️</div>

        <div className="not-found-buttons">
          <button 
            className="not-found-btn primary"
            onClick={() => navigate('/')}
          >
            На главную
          </button>
          <button 
            className="not-found-btn secondary"
            onClick={() => navigate(-1)}
          >
            ← Вернуться назад
          </button>
        </div>

        <p className="error-help">
          Если вы считаете, что это ошибка, пожалуйста, <a href="mailto:support@alivagain.com">свяжитесь с нами</a>.
        </p>
      </div>
    </div>
  )
}
