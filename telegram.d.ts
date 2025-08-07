// telegram.d.ts

// Это говорит TypeScript, что мы расширяем глобальный объект Window
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Теперь опишем сам интерфейс TelegramWebApp со всеми нужными полями и методами
 interface TelegramWebApp {
  initData: string;
  initDataUnsafe: WebAppInitData;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: ThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  openTelegramLink(url: string): void;
  BackButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(disable?: boolean): void;
    hideProgress(): void;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  
  // Методы для событий, которые вызывали ошибку
  onEvent(eventType: 'themeChanged' | 'viewportChanged', eventHandler: () => void): void;
  offEvent(eventType: 'themeChanged' | 'viewportChanged', eventHandler: () => void): void;

  // Другие полезные методы
  ready(): void;
  expand(): void;
  close(): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (isConfirmed: boolean) => void): void;
}

 interface ThemeParams {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
}

 interface WebAppInitData {
  query_id?: string;
  user?: WebAppUser;
}

 interface WebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;

}