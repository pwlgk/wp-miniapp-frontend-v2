// context/TelegramContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Убедитесь, что у вас есть файл telegram.d.ts с глобальными типами
// declare global { interface Window { Telegram?: { WebApp: TelegramWebApp } } }
// interface TelegramWebApp { ... }

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  isReady: boolean; // Флаг, что webApp готов к использованию
}

const TelegramContext = createContext<TelegramContextType>({ webApp: null, isReady: false });

export const useTelegram = () => useContext(TelegramContext);

export const TelegramProvider = ({ children }: { children: ReactNode }) => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tgWindow = window as any;
    if (tgWindow.Telegram?.WebApp) {
      const app = tgWindow.Telegram.WebApp;
      app.ready(); // Сообщаем, что приложение готово
      setWebApp(app);
      setIsReady(true);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ webApp, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
};