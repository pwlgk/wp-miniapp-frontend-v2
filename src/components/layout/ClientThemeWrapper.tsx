// components/layout/ClientThemeWrapper.tsx
"use client";

import { useTelegram } from "@/hooks/useTelegram";
import { useEffect } from "react";

export default function ClientThemeWrapper({ children }: { children: React.ReactNode }) {
  const { webApp } = useTelegram();

  // Этот useEffect отвечает ТОЛЬКО за добавление класса 'dark' к <html>.
  // Это нужно, чтобы префиксы dark: работали по всему приложению.
  useEffect(() => {
    if (!webApp) return;

    const handleThemeChange = () => {
      const isDark = webApp.colorScheme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
    };
    
    handleThemeChange(); // Применяем тему сразу при загрузке
    webApp.onEvent('themeChanged', handleThemeChange);

    return () => {
      webApp.offEvent('themeChanged', handleThemeChange);
    };
  }, [webApp]);

  // Этот div является нашей "клиентской версией body".
  // Он рендерится на клиенте, поэтому он всегда будет иметь правильные классы темы.
  return (
    <div className="bg-main-bg dark:bg-dark-bg text-main-text dark:text-dark-text transition-colors duration-300 min-h-screen">
      {children}
    </div>
  );
}