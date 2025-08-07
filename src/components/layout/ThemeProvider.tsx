// components/layout/ThemeProvider.tsx
"use client";

import { useTelegram } from "@/hooks/useTelegram";
import { useEffect, useState } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { webApp } = useTelegram();
  const [isThemeSet, setIsThemeSet] = useState(false);

  useEffect(() => {
    if (webApp) {
      const handleThemeChange = () => {
        const isDark = webApp.colorScheme === 'dark';
        document.documentElement.classList.toggle('dark', isDark);
        // Устанавливаем флаг, что тема определена
        setIsThemeSet(true); 
      };
      
      handleThemeChange();
      webApp.onEvent('themeChanged', handleThemeChange);

      return () => {
        webApp.offEvent('themeChanged', handleThemeChange);
      };
    }
  }, [webApp]);
  
  // Пока тема не определена, можно показывать заглушку или ничего не рендерить,
  // чтобы избежать "моргания" стилей.
  if (!isThemeSet) {
    return null; // или <Spinner />
  }

  return (
    // Оборачиваем дочерние элементы в div, к которому применяем наши стили
    <div className="bg-main-bg dark:bg-dark-bg text-main-text dark:text-dark-text transition-colors duration-300">
      {children}
    </div>
  );
}