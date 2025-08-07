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

const notificationIcons = {
  success: <CheckCircle className="text-green-500" />,
  error: <AlertTriangle className="text-red-500" />,
  info: <Info className="text-blue-500" />,
};

const notificationStyles = {
    success: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700',
    error: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700',
    info: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700',
}

export const NotifierProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000); // Автоскрытие через 4 секунды
  }, []);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotifierContext.Provider value={{ notify }}>
      {children}
      {/* Контейнер для всех уведомлений */}
      <div className="fixed top-4 right-4 z-[100] w-full max-w-sm space-y-2">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: -50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.5 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border ${notificationStyles[n.type]}`}
            >
              <div className="flex-shrink-0">{notificationIcons[n.type]}</div>
              <p className="flex-grow text-sm text-light-text dark:text-dark-text">{n.message}</p>
              <button onClick={() => removeNotification(n.id)} className="flex-shrink-0">
                <X size={18} className="text-gray-500" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotifierContext.Provider>
  );
};