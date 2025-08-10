// components/providers/QueryProvider.tsx
"use client";

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // для отладки

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Создаем инстанс клиента. `useState` гарантирует, что он создается только один раз.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Настройки по умолчанию для всех запросов
        staleTime: 1000 * 60, // 1 минута "свежести" данных, в это время не будет фоновых запросов
        refetchOnWindowFocus: false, // Отключаем перезагрузку при фокусе на окне
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}