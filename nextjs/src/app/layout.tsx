import './globals.css'
import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import ThemeRegistry from './components/ThemeRegistry/ThemeRegistry'
import { Navbar } from './components/Navbar'

export const metadata: Metadata = {
  title: 'API do Google Maps com NextJs e NestJs',
  description: 'Sistema de rastreamento de veículos utlizando microserviços e websocket',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <Navbar/>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  )
}
