import type { Metadata, Viewport } from 'next'
import { Cinzel, MedievalSharp, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const _cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const _medieval = MedievalSharp({ subsets: ["latin"], weight: ["400"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Dungeon Conquest',
  description: 'A dark fantasy incremental clicker game - defeat monsters, earn gold, upgrade your arsenal!',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon-512.png', // Apple necesita su propio PNG
  },
};

// Esto bloquea el zoom con los dedos para que se sienta como una App nativa
export const viewport: Viewport = {
  themeColor: '#1A0B02', // El color de la barra de estado del móvil
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
