import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCurrentUser,
  getRoomMessages,
  sendRoomMessage,
  subscribeToRoom,
  getUserProfile
} from '../services/supabase'
import '../styles/chat.css'

export default function Chat() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const listRef = useRef(null)

  useEffect(() => {
    let sub
    ;(async () => {
      const { data: { user: currentUser } } = await getCurrentUser()
      if (!currentUser) {
        navigate('/auth')
        return
      }
      setUser(currentUser)

      const res = await getRoomMessages()
      if (res.success) setMessages(res.messages || [])
      setLoading(false)

      sub = subscribeToRoom((msg) => {
        setMessages(prev => [...prev, msg])
      })
    })()

    return () => {
      try { sub?.unsubscribe?.() } catch (err) { /* noop */ }
    }
  }, [navigate])

  useEffect(() => {
    // auto-scroll
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!text.trim() || !user) return

    const payload = text.trim()
    setText('')

    // optimistic UI
    const temp = {
      id: `tmp-${Date.now()}`,
      content: payload,
      sender_id: user.id,
      sender_email: user.email,
      created_at: new Date().toISOString(),
      pending: true
    }
    setMessages(m => [...m, temp])

    const res = await sendRoomMessage(user.id, payload)
    if (!res.success) {
      setMessages(m => m.filter(x => x.id !== temp.id))
      console.error('sendRoomMessage:', res.error)
      alert('Не удалось отправить сообщение — попробуйте ещё раз')
      return
    }

    // replace temporary message with server message
    setMessages(m => m.map(x => (x.id === temp.id ? res.message : x)))
  }

  if (loading) return <div className="loading-screen">Загрузка чата...</div>

  return (
    <div className="chat-page container">
      <h2>Чат сообщества</h2>
      <div className="chat-wrapper">
        <div className="messages" ref={listRef}>
          {messages.length === 0 && (
            <div className="empty">Ещё нет сообщений — начните первым 👋</div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.pending ? 'pending' : ''}`}>
              <div className="meta">
                <span className="sender">{(msg.sender_email || msg.sender_username || 'Пользователь').split?.('@')?.[0] || 'User'}</span>
                <span className="time">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
              </div>
              <div className="body">{msg.content}</div>
            </div>
          ))}
        </div>

        <form className="chat-input" onSubmit={handleSend}>
          <input
            aria-label="Сообщение"
            placeholder="Напишите сообщение..."
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={1000}
          />
          <button type="submit" className="send-btn">Отправить</button>
        </form>

        <div className="chat-hint">Только авторизованные пользователи могут отправлять сообщения.</div>
      </div>
    </div>
  )
}
