// components/layout/ClientWrapper.tsx
"use client";

// Этот компонент не делает ничего, кроме как предоставляет
// div, который рендерится на клиенте.
export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  // Применяем классы фона и текста здесь.
  // Этот div рендерится на клиенте, поэтому он всегда
  // будет корректно реагировать на класс .dark на <html>.
  return (
    <div className="bg-main-bg dark:bg-dark-bg text-main-text dark:text-dark-text min-h-screen transition-colors duration-300">
      {children}
    </div>
  );
}