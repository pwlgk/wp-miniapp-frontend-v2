// hooks/useTelegram.ts
"use client";

import { useEffect, useState } from 'react';

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    // Явно приводим 'window' к типу 'any', чтобы TypeScript
    // не проверял наличие 'Telegram' на этом этапе.
    // Мы сами гарантируем его наличие с помощью проверки ниже.
    const tgWindow = window as any;

    if (typeof tgWindow !== 'undefined' && tgWindow.Telegram) {
      const app = tgWindow.Telegram.WebApp;
      if (app) {
        app.ready();
        setWebApp(app);
      }
    }
  }, []);
  const user = webApp?.initDataUnsafe?.user;

  return { webApp, user };
}

