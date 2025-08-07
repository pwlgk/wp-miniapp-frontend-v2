// components/layout/BottomNavBar.tsx
"use client";

import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/context/NavigationContext'; // <-- Наша навигация

const navItems = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/catalog', label: 'Каталог', icon: LayoutGrid },
  { href: '/cart', label: 'Корзина', icon: ShoppingCart, id: 'cart' },
  { href: '/profile', label: 'Профиль', icon: User },
];

export default function BottomNavBar() {
  const pathname = usePathname();
  const { state: cartState } = useCart();
  const { push, reset } = useNavigation(); // <-- Получаем функции навигации

  const totalItems = cartState.items.reduce((total, item) => total + item.quantity, 0);

  // --- НОВЫЙ ОБРАБОТЧИК ДЛЯ КЛИКОВ ---
  const handleNavigate = (path: string) => {
    // Если мы уже на этой странице, ничего не делаем
    if (pathname === path) return;

    // Сбрасываем историю и переходим
    reset();
    push(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-sm border-t border-gray-200 flex justify-around items-center z-50">
      {navItems.map((item) => {
        // Проверяем, активна ли текущая вкладка
        const isActive = pathname === item.href || (item.href === '/profile' && pathname.startsWith('/profile'));
        
        return (
          // --- КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Link заменен на button ---
          <button
            key={item.href}
            onClick={() => handleNavigate(item.href)}
            className="relative flex flex-col items-center justify-center w-full h-full"
            aria-label={item.label}
          >
            <div className="relative">
              <item.icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2}
                // Используем простые цвета Tailwind, так как мы отказались от темной темы
                className={isActive ? 'text-accent' : 'text-gray-500'}
              />
              <AnimatePresence>
                {item.id === 'cart' && totalItems > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute -top-1 -right-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <span className={`text-xs mt-1 ${isActive ? 'text-accent font-semibold' : 'text-gray-500'}`}>
                {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}