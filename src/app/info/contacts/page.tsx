// app/info/contacts/page.tsx
"use client";

import Image from 'next/image';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';
import { Mail, MessageCircle, Send } from 'lucide-react';
import { useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import Button from '@/components/ui/Button';

// --- Компонент для красивого отображения контакта ---
const ContactOption = ({ icon: Icon, title, value, href }: { icon: React.ElementType, title: string, value: string, href: string }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="block p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
  >
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <div>
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-lg font-semibold text-main-text">{value}</p>
      </div>
    </div>
  </a>
);


export default function ContactsPage() {
  const { setupBackButton, hideMainButton } = useTelegramButtons();
  const { webApp } = useTelegram();

  useEffect(() => {
    setupBackButton(true);
    hideMainButton();
  }, [setupBackButton, hideMainButton]);

  // Функция для открытия чата с менеджером внутри Telegram
  const openTelegramChat = () => {
    // Замените 'YOUR_USERNAME' на ваш реальный username или ID в Telegram
    webApp?.openTelegramLink(`https://t.me/lena_sharova55`);
  };
  const openTelegramChannel = () => {
    // Замените 'YOUR_USERNAME' на ваш реальный username или ID в Telegram
    webApp?.openTelegramLink(`https://t.me/kosynkastore55`);
  };
  return (
    <div className="bg-main-bg">
      {/* 1. Главный баннер */}
      <div className="relative w-full h-48">
        <Image
          src="/images/contacts-hero.jpeg" // Замените на свое изображение
          alt="Контакты"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
          <h1 className="text-3xl font-bold text-white text-center drop-shadow-lg">
            Остаемся на связи
          </h1>
        </div>
      </div>
      
      <div className="p-4 space-y-8">
        {/* Вводный текст */}
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Есть вопросы?</h2>
            <p className="text-gray-600 max-w-md mx-auto">
                Мы всегда рады помочь вам с выбором, ответить на вопросы о доставке или просто пообщаться. Выберите удобный для вас способ связи.
            </p>
        </div>

        {/* --- ГЛАВНАЯ КНОПКА: ЧАТ В TELEGRAM --- */}
        <div className="pt-2">
            <Button onClick={openTelegramChat} variant="primary" className="flex items-center justify-center gap-3 !py-4">
                <Send size={22} />
                <span className="text-lg">Написать в Telegram</span>
            </Button>
        </div>
        <div className="pt-2">
            <Button onClick={openTelegramChannel} variant="primary" className="flex items-center justify-center gap-3 !py-4">
                <MessageCircle size={22} />
                <span className="text-lg">Канал в Telegram</span>
            </Button>
        </div>
        {/* --- БЛОКИ С АЛЬТЕРНАТИВНЫМИ КОНТАКТАМИ --- */}
        <div className="space-y-4">
          {/* <ContactOption 
            icon={MessageCircle} 
            title="Канал в Telegram" 
            value="@kosynkastore" // Замените на ваш канал
            href="https://t.me/kosynkastore" // Замените на ваш канал
          /> */}
          <ContactOption 
            icon={Mail} 
            title="Электронная почта" 
            value="contact@kosynkastore.ru" // Замените на вашу почту
            href="mailto:contact@kosynkastore.ru" // Замените на вашу почту
          />
        </div>
        
        {/* --- Юридическая информация (необязательно, но полезно для доверия) --- */}
        {/* <div className="text-center text-xs text-gray-400 pt-4">
            <p>ИП Гейко Павел Николаевич</p>
            <p>ИНН 123456789</p>
        </div> */}
      </div>
    </div>
  );
}