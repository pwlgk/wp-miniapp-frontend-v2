// context/NotifierContext.tsx
"use client";

import { createContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotifierContextProps {
  notify: (message: string, type?: NotificationType) => void;
}

export const NotifierContext = createContext<NotifierContextProps | null>(null);

// --- УЛУЧШЕННЫЕ СТИЛИ И ИКОНКИ ---

// Иконки теперь имеют цвет, соответствующий теме
const notificationIcons: Record<NotificationType, ReactNode> = {
  success: <CheckCircle className="text-green-500" />,
  error: <AlertTriangle className="text-red-500" />,
  info: <Info className="text-blue-400" />,
};

// Стили теперь используют пастельную палитру и выглядят более мягко
const notificationStyles: Record<NotificationType, string> = {
    success: 'bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700',
    error: 'bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700',
    info: 'bg-white dark:bg-dark-secondary border-gray-200 dark:border-gray-700',
}

export const NotifierProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Date.now();
    // Показываем не более 3 уведомлений одновременно для чистоты интерфейса
    setNotifications(prev => [...prev, { id, message, type }].slice(-3));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotifierContext.Provider value={{ notify }}>
      {children}
      
      {/* --- ИСПРАВЛЕННЫЙ КОНТЕЙНЕР УВЕДОМЛЕНИЙ --- */}
      <div 
        // Позиционирование по центру с небольшим отступом сверху
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md space-y-3"
      >
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              layout // `layout` плавно сдвигает остальные уведомления
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }} // Анимация выхода теперь симметрична
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} // Более плавная анимация
              // --- УЛУЧШЕННЫЕ СТИЛИ САМОГО УВЕДОМЛЕНИЯ ---
              className={`flex items-start gap-4 p-4 rounded-xl shadow-lg backdrop-blur-sm border ${notificationStyles[n.type]}`}
            >
              <div className="flex-shrink-0 mt-0.5">{notificationIcons[n.type]}</div>
              <p className="flex-grow text-sm font-medium text-light-text dark:text-dark-text">{n.message}</p>
              <button 
                onClick={() => removeNotification(n.id)} 
                className="flex-shrink-0 p-1 -m-1 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotifierContext.Provider>
  );
};