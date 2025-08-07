// app/profile/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { getMyInfo } from '@/services/api';
import { Customer } from '@/types';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { BookUser, Edit, Info, LogOut, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import Image from 'next/image';
import { useTelegram } from '@/hooks/useTelegram';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';
import { useNavigation } from '@/context/NavigationContext'; // Наша навигация
import { usePathname, useSearchParams } from 'next/navigation'; // Для получения текущего URL

export default function ProfilePage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { webApp, user: telegramUser, initData } = useTelegram();
  const { setupBackButton, hideMainButton } = useTelegramButtons();

  // --- ИМПОРТИРУЕМ ХУКИ ДЛЯ НАВИГАЦИИ ---
  const { push } = useNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // На странице профиля кнопка "Назад" должна вести на главную,
    // так что мы можем ее скрыть, а пользователь воспользуется BottomNavBar.
    // Либо, если у вас нет BottomNavBar, можно оставить setupBackButton(true).
    setupBackButton(true); 
    hideMainButton();
  }, [setupBackButton, hideMainButton]);

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      // Проверяем, что initData не null, перед запросом
      if (!initData) return;
      
      try {
        setIsLoading(true);
        // 2. Передаем initData в API-функцию
        const data = await getMyInfo(initData);
        setCustomer(data);
      }catch (e: any) {
        setError(e.message || "Не удалось загрузить данные профиля");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomerInfo();
  }, []);

  // --- НОВЫЙ ОБЩИЙ ОБРАБОТЧИК ДЛЯ НАВИГАЦИИ ---
  const handleNavigate = (newPath: string) => {
    const currentPath = `${pathname}?${searchParams.toString()}`;
    push(newPath);
  };

  const handleLogout = () => {
    webApp?.close();
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error) return <ErrorMessage message={error} />;

  const avatarLetter = customer?.first_name?.[0]?.toUpperCase() || telegramUser?.first_name?.[0]?.toUpperCase();
  const avatarUrl = telegramUser?.photo_url;

  return (
    <div className="p-4 space-y-8">
      {/* Шапка профиля */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="relative w-24 h-24 rounded-full bg-accent flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Telegram Avatar" fill className="object-cover" sizes="96px" />
          ) : (
            <span className="text-4xl font-bold text-white">{avatarLetter}</span>
          )}
        </div>
        <h1 className="text-2xl font-bold">{customer?.first_name} {customer?.last_name}</h1>
      </div>

      {/* Меню действий */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold px-2">Информация</h2>
        
        {/* --- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Link заменен на button с onClick --- */}
        <button onClick={() => handleNavigate('/profile/edit')} className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm text-left">
          <div className="flex items-center gap-4">
            <Edit className="w-6 h-6 text-accent" />
            <span className="font-semibold">Редактировать профиль</span>
          </div>
        </button>
        <button onClick={() => handleNavigate('/orders')} className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm text-left">
          <div className="flex items-center gap-4">
            <ShoppingBag className="w-6 h-6 text-accent" />
            <span className="font-semibold">История заказов</span>
          </div>
        </button>
        <button onClick={() => handleNavigate('/info/about')} className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm text-left">
          <div className="flex items-center gap-4">
            <Info className="w-6 h-6 text-accent" />
            <span className="font-semibold">О магазине</span>
          </div>
        </button>
        <button onClick={() => handleNavigate('/info/delivery')} className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm text-left">
          <div className="flex items-center gap-4">
            <Truck className="w-6 h-6 text-accent" />
            <span className="font-semibold">Доставка и оплата</span>
          </div>
        </button>
        <button onClick={() => handleNavigate('/info/contacts')} className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm text-left">
          <div className="flex items-center gap-4">
            <BookUser className="w-6 h-6 text-accent" />
            <span className="font-semibold">Контакты</span>
          </div>
        </button>
        <button onClick={() => handleNavigate('/info/privacy-policy')} className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm text-left">
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-6 h-6 text-accent" />
            <span className="font-semibold">Политика конфиденциальности</span>
          </div>
        </button>
      </div>

      {/* Кнопка выхода */}
      <div className="pt-4">
        <button onClick={handleLogout} className="flex items-center justify-center w-full gap-3 p-3 text-red-500 bg-red-500/10 rounded-xl">
          <LogOut size={20} />
          <span className="font-bold">Выйти</span>
        </button>
      </div>
    </div>
  );
}