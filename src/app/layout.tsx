// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import BottomNavBar from '@/components/layout/BottomNavBar';
// ThemeProvider больше не нужен
import { CartProvider } from '@/context/CartContext';
import { TelegramProvider } from '@/context/TelegramContext';
import { NotifierProvider } from '@/context/NotifierContext';
import { NavigationProvider } from '@/context/NavigationContext';

export const metadata: Metadata = {
  title: 'Kosynka Store',
  description: 'Магазин стильных и качественных аксессуаров для волос, где каждая деталь — это сочетание эстетики, удобства и долговечности. Создавайте уникальные образы с аксессуарами, которые вдохновляют и подчеркивают вашу индивидуальность.',
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    // Теперь здесь нет и не может быть класса .dark
    <html lang="ru" suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      
      {/* 
        <body> ПОЛНОСТЬЮ ЧИСТЫЙ. 
        Стили на него применяются из globals.css.
      */}
      <body className="bg-white  text-light-text transition-colors duration-300">
      <TelegramProvider>
          <CartProvider>
            <NotifierProvider>
            <NavigationProvider>
                  <main className="pb-24">{children}</main>
                  <BottomNavBar />
                </NavigationProvider>
            </NotifierProvider>
          </CartProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}