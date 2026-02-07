import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Auth from './pages/Auth'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Chat from './pages/Chat'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/global.css'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
