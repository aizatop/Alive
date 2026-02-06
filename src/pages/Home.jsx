import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, signOut, recordVisit } from '../services/supabase'
import CountryCard from '../components/CountryCard'
import LoginModal from '../components/LoginModal'
import Header from '../components/Header'
import AboutProject from '../components/AboutProject'
import Footer from '../components/Footer'
import '../styles/home.css'

const COUNTRIES = [
  {
    id: 'japan',
    name: 'Япония',
    description: 'Япония - удивительная страна, где древние традиции встречаются с современными технологиями. От величественных храмов до инновационных городов, Япония предлагает уникальное путешествие в культуру, искусство и природу.',
    image: 'https://resize.tripster.ru/g_luU5kGMuMmG4fN1o0udHBw9yA=/fit-in/1080x1440/filters:no_upscale()/https://cdn.tripster.ru/photos/ab88bae9-9e48-4fa9-ae92-04ea32299330.jpg',
    video: 'https://youtu.be/YIo2tJSkidk?si=Yzb4eK2ZzfB90s8z',
    attractions: [
      '🏯 Замок Осаки - символ японской истории',
      '⛩️ Святилище Фушими Инари - тысячи красных ворот',
      '🗻 Гора Фудзи - самая высокая вершина Японии',
      '🏮 Храм Золотого павильона в Киото',
      '🌸 Сад камней Рёан-дзи'
    ]
  },
  {
    id: 'france',
    name: 'Франция',
    description: 'Франция - страна любви, искусства и изысканного вкуса. От романтичного Парижа до южного очарования Прованса, здесь на каждом углу царит атмосфера элегантности и культуры.',
    image: 'https://as1.ftcdn.net/jpg/01/47/49/76/1000_F_147497684_2GfgE05sJ8hxeYsZZTm6tBu2EHCc98G2.jpg',
    video: 'https://youtu.be/EkshFcLESPU?si=SDj9VQYjR9_nb154',
    attractions: [
      '🗼 Эйфелева башня - символ Парижа',
      '🏰 Версальский дворец - величие королевской власти',
      '⛪ Собор Нотр-Дам де Шартр',
      '🎭 Лувр - крупнейший музей мира',
      '🍷 Виноградники Бордо и Бургундии'
    ]
  },
  {
    id: 'italy',
    name: 'Италия',
    description: 'Италия - колыбель Возрождения и европейской культуры. С потрясающей архитектурой, вкусной кухней и гостеприимными людьми, Италия очаровывает каждого путешественника.',
    image: 'https://img.freepik.com/premium-photo/scenic-view-sea-against-sky_1048944-25393574.jpg?semt=ais_hybrid&w=740',
    video: 'https://youtu.be/pwivE6bvD8w?si=52ocgv3QkNGHoAH7',
    attractions: [
      '🏛️ Колизей в Риме - величие древнеримской архитектуры',
      '⛪ Собор Святого Петра в Ватикане',
      '🚤 Венеция - город каналов и романтики',
      '🗿 Галерея Уффици - шедевры Возрождения',
      '🌊 Побережье Амальфи'
    ]
  },
  {
    id: 'united-kingdom',
    name: 'Соединённое Королевство',
    description: 'Соединённое Королевство - страна с богатой историей и одна из самых влиятельных держав мира. Сочетание истории, современности и британского очарования делает Соединённое Королевство незабываемым местом для посещения.',
    image: 'https://i.pinimg.com/originals/a3/b4/a8/a3b4a8962647ba45905ce683d03a60c6.jpg',
    video: 'https://youtu.be/SNx8B_oE8IY?si=IQwAu6rWwdCnVBSh',
    attractions: [
      '👑 Букингемский дворец - резиденция монарха',
      '🕐 Башня Элизабет (Биг-Бен)',
      '🌉 Лондонский мост',
      '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Вестминстерское аббатство',
      '🎡 Лондонский глаз - колесо обозрения'
    ]
  }
]

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [expandedCountry, setExpandedCountry] = useState(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user: currentUser } } = await getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }

  const handleVideoClick = async (countryName) => {
    if (user) {
      const result = await recordVisit(user.id, countryName, 30)
      if (result.success) {
        console.log(`✅ Посещение ${countryName} записано!`)
      }
    }
  }

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setExpandedCountry(null)
  }

  const handleLoginSuccess = async () => {
    setIsLoginModalOpen(false)
    await checkAuth()
  }

  if (loading) {
    return <div className="loading-screen">Загружается...</div>
  }

  return (
    <>
      {/* Header only for authenticated users */}
      {user && <Header onLogout={handleLogout} userName={user?.email} />}

      {/* Hero section only for non-authenticated users */}
      {!user && (
        <div className="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">AliveAgain</h1>
            <p className="hero-subtitle">Путешествуй по миру виртуально 🌍</p>
            <p className="hero-description">
              Откройте для себя удивительные страны, их достопримечательности и культуру
            </p>
            <button
              className="hero-login-btn"
              onClick={() => setIsLoginModalOpen(true)}
            >
              Начать путешествие
            </button>
          </div>
        </div>
      )}

      {/* Country cards - available for all users */}
      <main className="container">
        <div className="countries-grid">
          {COUNTRIES.map(country => (
            <CountryCard
              key={country.id}
              country={country}
              isExpanded={expandedCountry === country.id}
              onToggle={() => setExpandedCountry(expandedCountry === country.id ? null : country.id)}
              onVideoClick={handleVideoClick}
              isAuthenticated={!!user}
              onLoginRequired={() => setIsLoginModalOpen(true)}
            />
          ))}
        </div>
      </main>

      {/* About Project - available for all users */}
      <AboutProject />

      {/* CTA section only for non-authenticated users */}
      {!user && (
        <section className="cta-section">
          <div className="cta-content">
            <h2>Готовы начать свое путешествие?</h2>
            <p>Присоединяйтесь к нам и откройте красоту планеты</p>
            <button
              className="cta-btn"
              onClick={() => setIsLoginModalOpen(true)}
            >
              Зарегистрироваться
            </button>
          </div>
        </section>
      )}

      {/* Footer - available for all users */}
      <Footer />

      {/* LoginModal only for non-authenticated users */}
      {!user && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  )
}
