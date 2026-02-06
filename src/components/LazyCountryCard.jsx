import React, { lazy, Suspense } from 'react'

const CountryCard = lazy(() => import('./CountryCard'))

export default function LazyCountryCard(props) {
  return (
    <Suspense fallback={<div className="card-loading">Загрузка...</div>}>
      <CountryCard {...props} />
    </Suspense>
  )
}
