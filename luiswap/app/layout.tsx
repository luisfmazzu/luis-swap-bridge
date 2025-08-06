import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { DynamicWeb3Provider } from '@/components/web3/dynamic-web3-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Luiswap',
  description: 'React, Wagmi, Turnkey',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <DynamicWeb3Provider>
          {children}
        </DynamicWeb3Provider>
      </body>
    </html>
  )
}
