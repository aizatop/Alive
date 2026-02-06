import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import './styles/global.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
