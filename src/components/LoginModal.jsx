import React, { useState } from 'react'
import { signIn, signUp } from '../services/supabase'
import '../styles/login-modal.css'

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    country: ''
  })

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData(prev => ({ ...prev, [name]: value }))
  }

  const handleRegisterChange = (e) => {
    const { name, value } = e.target
    setRegisterData(prev => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!loginData.email || !loginData.password) {
        throw new Error('Заполните все поля')
      }

      const result = await signIn(loginData.email, loginData.password)

      if (result.success) {
        setSuccess('✅ Вход успешен!')
        setTimeout(() => {
          onLoginSuccess()
        }, 1000)
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      let errorMessage = err.message
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Неверный email или пароль'
      }
      setError(`❌ ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { username, email, password, passwordConfirm } = registerData

      if (!username || !email || !password || !passwordConfirm) {
        throw new Error('Заполните все обязательные поля')
      }

      if (username.length < 3) {
        throw new Error('Имя пользователя должно быть минимум 3 символа')
      }

      if (!email.includes('@')) {
        throw new Error('Введите корректный email')
      }

      if (password.length < 8) {
        throw new Error('Пароль должен быть минимум 8 символов')
      }

      if (password !== passwordConfirm) {
        throw new Error('Пароли не совпадают')
      }

      const result = await signUp(email, password, username)

      if (result.success) {
        setSuccess('✅ Аккаунт создан! Проверьте email для подтверждения.')
        setTimeout(() => setIsLogin(true), 3000)
        setRegisterData({ username: '', email: '', password: '', passwordConfirm: '', country: '' })
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      let errorMessage = err.message
      if (errorMessage.includes('already registered')) {
        errorMessage = 'Этот email уже зарегистрирован'
      }
      setError(`❌ ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    setSuccess('')
    setLoginData({ email: '', password: '' })
    setRegisterData({ username: '', email: '', password: '', passwordConfirm: '', country: '' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>✕</button>

        <div className="modal-header">
          <h1 className="modal-logo">AliveAgain</h1>
          <p className="modal-tagline">Путешествуй по миру виртуально</p>
        </div>

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="modal-form">
            <h2>Вход в систему</h2>

            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                type="email"
                id="login-email"
                name="email"
                placeholder="your@email.com"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Пароль</label>
              <input
                type="password"
                id="login-password"
                name="password"
                placeholder="••••••••"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Загружается...' : 'Войти'}
            </button>

            <p className="toggle-auth">
              Нет аккаунта?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false)
                  setError('')
                  setSuccess('')
                }}
                className="toggle-btn"
              >
                Зарегистрироваться
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="modal-form">
            <h2>Создать аккаунт</h2>

            <div className="form-group">
              <label htmlFor="register-username">Имя пользователя</label>
              <input
                type="text"
                id="register-username"
                name="username"
                placeholder="Ваше имя"
                value={registerData.username}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email</label>
              <input
                type="email"
                id="register-email"
                name="email"
                placeholder="your@email.com"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Пароль</label>
              <input
                type="password"
                id="register-password"
                name="password"
                placeholder="••••••••"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password-confirm">Подтвердить пароль</label>
              <input
                type="password"
                id="register-password-confirm"
                name="passwordConfirm"
                placeholder="••••••••"
                value={registerData.passwordConfirm}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-country">Страна (опционально)</label>
              <input
                type="text"
                id="register-country"
                name="country"
                placeholder="Ваша страна"
                value={registerData.country}
                onChange={handleRegisterChange}
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Загружается...' : 'Зарегистрироваться'}
            </button>

            <p className="toggle-auth">
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true)
                  setError('')
                  setSuccess('')
                }}
                className="toggle-btn"
              >
                Войти
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
