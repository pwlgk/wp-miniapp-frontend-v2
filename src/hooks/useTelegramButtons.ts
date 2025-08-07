// hooks/useTelegramButtons.ts
"use client";

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from './useTelegram';
import { useNavigation } from '@/context/NavigationContext';

interface MainButtonParams {
  text: string;
  onClick: () => void;
  isVisible?: boolean;
  isProgressVisible?: boolean;
  isActive?: boolean;
}

export function useTelegramButtons() {
    const { webApp } = useTelegram();
    const { back } = useNavigation(); // Берем нашу новую функцию `back`
  
    const setupBackButton = useCallback((isVisible: boolean) => {
      if (webApp) {
        if (isVisible) {
          webApp.BackButton.onClick(back);
          webApp.BackButton.show();
        } else {
          webApp.BackButton.hide();
          webApp.BackButton.offClick(back);
        }
      }
    }, [webApp, back]);

  // Функция для настройки главной кнопки
  const setupMainButton = (params: MainButtonParams) => {
    if (webApp) {
      webApp.MainButton.setText(params.text);
      webApp.MainButton.onClick(params.onClick);
      
      if (params.isVisible) {
        webApp.MainButton.show();
      } else {
        webApp.MainButton.hide();
      }

      if (params.isProgressVisible) {
        webApp.MainButton.showProgress(false); // false - не блокировать кнопку
      } else {
        webApp.MainButton.hideProgress();
      }
      
      if (params.isActive === false) { // Проверяем именно на false
        webApp.MainButton.disable();
      } else {
        webApp.MainButton.enable();
      }
    }
  };
  
  // Функция для сброса/скрытия главной кнопки
  const hideMainButton = () => {
    if (webApp && webApp.MainButton.isVisible) {
        // Нужно отписать предыдущий обработчик, чтобы избежать утечек
        const emptyCb = () => {};
        webApp.MainButton.offClick(emptyCb);
        webApp.MainButton.hide();
    }
  }


  return { setupBackButton, setupMainButton, hideMainButton };
}