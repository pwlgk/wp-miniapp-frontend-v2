// hooks/useTelegram.ts
"use client";

import { useContext } from 'react';
import { TelegramContext } from '@/context/TelegramContext'; // Импортируем сам контекст

/**
 * Кастомный хук для удобного доступа к объекту Telegram WebApp,
 * данным пользователя и актуальной строке initData.
 * 
 * Должен использоваться внутри компонента, который является дочерним 
 * для <TelegramProvider>.
 * 
 * @returns {object} Объект, содержащий:
 * - `webApp`: Полный объект Telegram WebApp API.
 * - `user`: Объект с данными пользователя Telegram (first_name, photo_url и т.д.).
 * - `initData`: Актуальная, автоматически обновляемая строка initData для API запросов.
 */
export const useTelegram = () => {
  // Получаем значение из контекста
  const context = useContext(TelegramContext);

  // Проверяем, что хук используется в правильном месте дерева компонентов
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }

  return context;
};