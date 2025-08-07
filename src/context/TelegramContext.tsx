// context/TelegramContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';

// Убедитесь, что у вас есть файл telegram.d.ts с глобальными типами
// declare global { interface Window { Telegram?: { WebApp: TelegramWebApp } } }
// interface TelegramWebApp { user?: WebAppUser, initData?: string, ... }

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: WebAppUser | undefined;
  initData: string | null;
  isReady: boolean; // Оставляем флаг готовности
}

// Обновляем начальное значение
export const TelegramContext = createContext<TelegramContextType>({ 
  webApp: null, 
  user: undefined,
  initData: null,
  isReady: false 
});


export const TelegramProvider = ({ children }: { children: ReactNode }) => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [initData, setInitData] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tgWindow = window as any;
    if (tgWindow.Telegram?.WebApp) {
      const app = tgWindow.Telegram.WebApp;
      
      app.ready();
      setWebApp(app);
      setInitData(app.initData);
      setIsReady(true);

      const handleDataChange = () => {
        console.log('[Telegram] initData была обновлена Telegram.');
        setInitData(app.initData);
      };

      app.onEvent('initDataChange', handleDataChange);
      
      const intervalId = setInterval(() => {
        app.requestInitData?.();
      }, 55 * 60 * 1000);

      return () => {
        app.offEvent('initDataChange', handleDataChange);
        clearInterval(intervalId);
      };
    }
  }, []);

  const value = useMemo(() => {
    return {
      webApp,
      user: webApp?.initDataUnsafe?.user,
      initData,
      isReady,
    };
  }, [webApp, initData, isReady]);

  return (
    // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider> // <-- Было: </Telegram-context-provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);