import React from 'react'
import Header from './Header'
import Hero from './Hero'
import Features from './Features'
import HowItWorks from './HowItWorks'
import CTA from './CTA'
import Footer from './Footer'

const Landing = () => {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export default Landing
