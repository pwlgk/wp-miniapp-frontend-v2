// app/info/delivery/page.tsx
"use client";

import Image from 'next/image';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';
import { CheckCircle, Clock, CreditCard, Edit, Home, Inbox, Package, Send, ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';

// --- Компонент для красивого отображения пункта доставки ---
const DeliveryOption = ({ icon: Icon, title, recommended, children }: { icon: React.ElementType, title: string, recommended?: boolean, children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {recommended && (
        <span className="flex-shrink-0 text-xs font-bold bg-accent text-white px-3 py-1 rounded-full">
          Рекомендуем
        </span>
      )}
    </div>
    <div className="prose prose-sm max-w-none text-gray-600">
      {children}
    </div>
  </div>
);

// --- Компонент для шагов оформления ---
const HowToStep = ({ number, text }: { number: number, text: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-accent text-white font-bold rounded-full">
            {number}
        </div>
        <p className="pt-1">{text}</p>
    </div>
);


export default function DeliveryPage() {
  const { setupBackButton, hideMainButton } = useTelegramButtons();

  useEffect(() => {
    setupBackButton(true);
    hideMainButton();
  }, [setupBackButton, hideMainButton]);

  return (
    <div className="bg-main-bg">
      {/* 1. Главный баннер */}
      <div className="relative w-full h-48">
        <Image
          src="/images/delivery-hero.jpeg" // Замените на свое изображение
          alt="Доставка и оплата"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
          <h1 className="text-3xl font-bold text-white text-center drop-shadow-lg">
            Доставка и Оплата
          </h1>
        </div>
      </div>
      
      <div className="p-4 space-y-8">
        {/* Вводный текст */}
        <p className="text-center text-gray-600">
          Мы предлагаем несколько удобных и надёжных вариантов доставки. Ниже вы можете выбрать тот, который подойдёт именно вам.
        </p>

        {/* --- БЛОКИ С ВАРИАНТАМИ ДОСТАВКИ --- */}
        <div className="space-y-4">
          <DeliveryOption icon={ShoppingCart} title="5Post в «Пятёрочке»" recommended>
            <h4>Почему стоит выбрать 5Post?</h4>
            <p>Это самый выгодный, быстрый и удобный способ. Постаматы находятся прямо в магазинах «Пятёрочка», а значит — почти у каждого дома.</p>
            <ul>
              <li>📍 Удобно забирать без очередей</li>
              <li>⏳ Долгое хранение — до 7 дней</li>
              <li>💰 Фиксированная стоимость: <strong>138₽</strong> по России, <strong>95₽</strong> по городу</li>
            </ul>
            <p className="flex items-center gap-2 !mt-4"><CheckCircle size={16} className="text-green-600" /> <span>Это экономно, просто и быстро.</span></p>
          </DeliveryOption>

          <DeliveryOption icon={Package} title="Ozon">
            <p>Хороший вариант, если рядом нет «Пятёрочки» с постаматом.</p>
            <ul>
              <li>🕒 Срок хранения — 3 дня</li>
              <li>📦 Пункты выдачи Ozon есть во многих городах</li>
              <li>💰 Стоимость рассчитывается индивидуально</li>
            </ul>
          </DeliveryOption>

          <DeliveryOption icon={Home} title="СДЭК">
            <p>Доставка до ближайшего пункта выдачи или курьером прямо к вам домой. Для расчёта стоимости потребуется:</p>
            <ul>
              <li>ФИО</li>
              <li>Номер телефона</li>
              <li>Адрес ПВЗ СДЭК</li>
            </ul>
          </DeliveryOption>

          <DeliveryOption icon={Inbox} title="Почта России">
            <p>Доставка по всей стране. Для оформления нужно:</p>
            <ul>
              <li>ФИО</li>
              <li>Телефон</li>
              <li>Адрес отделения или индекс</li>
            </ul>
          </DeliveryOption>
          
          {/* Можно добавить и Авито, если нужно */}
        </div>

        {/* --- БЛОК ОПЛАТЫ --- */}
        <div className="p-6 bg-secondary rounded-2xl space-y-3">
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-accent"/>
            <h2 className="text-2xl font-bold">Оплата</h2>
          </div>
          <p>После выбора способа доставки мы рассчитаем итоговую сумму (товар + доставка). Оплата осуществляется по номеру телефона — мы пришлём реквизиты.</p>
        </div>

        {/* --- БЛОК "КАК ОФОРМИТЬ" --- */}
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Как оформить доставку</h2>
            <div className="space-y-4">
                <HowToStep number={1} text="Напишите нам в Telegram и выберите удобный способ доставки." />
                <HowToStep number={2} text="Для СДЭК или Почты России пришлите, пожалуйста, ФИО, телефон и адрес." />
                <HowToStep number={3} text="Мы рассчитаем точную стоимость и пришлём вам итоговую сумму." />
                <HowToStep number={4} text="Оплатите заказ по реквизитам, которые мы вам отправим." />
                <HowToStep number={5} text="После отправки вы получите трек-номер для отслеживания вашей посылки." />
            </div>
        </div>

        {/* --- ЗАКЛЮЧИТЕЛЬНЫЙ БЛОК --- */}
        <div className="text-center text-gray-600 pt-4">
            <p>Если у вас остались вопросы — напишите нам, мы с радостью поможем 🤍</p>
        </div>
      </div>
    </div>
  );
}