// context/NavigationContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface NavigationContextType {
  push: (path: string) => void;
  back: () => void;
  reset: () => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);
const HISTORY_STORAGE_KEY = 'navigation_history';

// --- Функции для работы с sessionStorage вынесены для чистоты ---
const getHistoryFromStorage = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = sessionStorage.getItem(HISTORY_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};
const saveHistoryToStorage = (history: string[]) => {
  sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  console.log('[Nav] История сохранена:', history);
};

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [history, setHistory] = useState<string[]>(getHistoryFromStorage);

  // --- Центральный слушатель URL ---
  // Он будет нашим главным источником правды об истории
  useEffect(() => {
    const currentUrl = `${pathname}?${searchParams.toString()}`;

    setHistory(prevHistory => {
      // Если это самый первый URL сессии, добавляем его
      if (prevHistory.length === 0) {
        const newHistory = [currentUrl];
        saveHistoryToStorage(newHistory);
        return newHistory;
      }

      const lastUrlInHistory = prevHistory[prevHistory.length - 1];

      // --- КЛЮЧЕВАЯ ЛОГИКА ---
      // Если текущий URL не совпадает с последним в истории,
      // значит, это новый переход вперед. Добавляем его.
      if (lastUrlInHistory !== currentUrl) {
        const newHistory = [...prevHistory, currentUrl];
        saveHistoryToStorage(newHistory);
        return newHistory;
      }
      
      // Если URL совпадает, ничего не делаем, чтобы избежать дублирования.
      return prevHistory;
    });
  }, [pathname, searchParams]);

  // `push` теперь очень простой: он просто вызывает router.push.
  // `useEffect` выше сделает всю работу по обновлению истории.
  const push = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  // `back` теперь работает с историей из состояния
  const back = useCallback(() => {
    // 1. Сначала получаем, куда возвращаться, НЕ меняя состояние
    const pathToReturnTo = history.length > 1 ? history[history.length - 2] : null;

    if (pathToReturnTo) {
      // 2. Выполняем навигацию
      router.replace(pathToReturnTo);
      // 3. ТОЛЬКО ПОСЛЕ ЭТОГО обновляем наше состояние истории
      setHistory(prev => prev.slice(0, -1));
    } else {
      // Если в нашей истории некуда возвращаться, используем нативный back
      router.back();
    }
  }, [history, router]);
  const reset = useCallback(() => {
    // Получаем текущий URL, чтобы он стал единственной записью в истории
    const currentUrl = `${pathname}?${searchParams.toString()}`;
    const newHistory = [currentUrl];
    setHistory(newHistory);
    saveHistoryToStorage(newHistory);
    console.log('[Nav] История сброшена.');
  }, [pathname, searchParams]); 
  const canGoBack = history.length > 1;

  return (
    <NavigationContext.Provider value={{ push, back, canGoBack, reset }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) { throw new Error('useNavigation must be used within a NavigationProvider'); }
  return context;
};