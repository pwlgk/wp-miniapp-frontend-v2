// hooks/useNotifier.ts
import { useContext } from 'react';
import { NotifierContext } from '@/context/NotifierContext'; // Создадим его следующим

export const useNotifier = () => {
  const context = useContext(NotifierContext);
  if (!context) {
    throw new Error('useNotifier must be used within a NotifierProvider');
  }
  return context;
};