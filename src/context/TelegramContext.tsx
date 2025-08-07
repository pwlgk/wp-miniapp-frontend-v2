// context/TelegramContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { registerUser } from '@/services/api'; // Импортируем нашу новую функцию



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

      // --- НОВАЯ ЛОГИКА: Запрос на разрешение ---
      const checkAndRequestWriteAccess = async () => {
        // Проверяем в localStorage, чтобы не спрашивать каждый раз
        const hasRequested = localStorage.getItem('write_access_requested');
        if (hasRequested) {
          return; // Уже спрашивали, выходим
        }

        // --- ДОПОЛНИТЕЛЬНАЯ ЗАЩИТА ---
        // Ждем небольшую паузу, чтобы пользователь успел увидеть интерфейс,
        // прежде чем показывать ему системный попап.
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 секунды

        // Показываем нативный попап Telegram
        app.requestWriteAccess?.((accessGranted: boolean) => {
          // Запоминаем, что мы уже спрашивали
          localStorage.setItem('write_access_requested', 'true');

          if (accessGranted) {
            console.log('[Telegram] Пользователь разрешил отправку сообщений.');
            // Если разрешил, отправляем фоновый запрос на регистрацию
            registerUser(app.initData)
              .then(() => console.log('[API] Пользователь успешно зарегистрирован для уведомлений.'))
              .catch(err => console.error('[API] Ошибка регистрации пользователя:', err));
          } else {
            console.log('[Telegram] Пользователь отклонил запрос на отправку сообщений.');
          }
        });
      };
      
      checkAndRequestWriteAccess();
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