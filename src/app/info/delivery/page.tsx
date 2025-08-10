// app/info/delivery/page.tsx
"use client";

import Image from 'next/image';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';
import { CheckCircle, Clock, CreditCard, Edit, Home, Inbox, Package, Send, ShoppingBag, ShoppingCart, Truck } from 'lucide-react';
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
          Мы предлагаем несколько удобных и надёжных вариантов доставки. Вы можете выбрать тот, который подойдёт именно вам.
        </p>

        {/* --- БЛОКИ С ВАРИАНТАМИ ДОСТАВКИ --- */}
        <div className="space-y-4">
          <DeliveryOption icon={ShoppingCart} title="5Post в «Пятёрочке»" recommended>
            <h4>Почему стоит выбрать 5Post?</h4>
            <p>Это самый выгодный, быстрый и удобный способ. Постаматы находятся прямо в магазинах «Пятёрочка», а значит — почти у каждого дома.</p>
            <ul>
              <li>📍 Удобно забирать без очередей</li>
              <li>⏳ Долгое хранение — до 7 дней</li>
              <li>💰 Cтоимость: от <strong>90₽</strong> до <strong>150₽</strong> по России</li>
            </ul>
            <p className="flex items-center gap-2 !mt-4"><CheckCircle size={16} className="text-green-600" /> <span>Это экономно, просто и быстро.</span></p>
          </DeliveryOption>

          {/* <DeliveryOption icon={Package} title="Ozon">
            <p>Хороший вариант, если рядом нет «Пятёрочки» с постаматом.</p>
            <ul>
              <li>🕒 Срок хранения — 3 дня</li>
              <li>📦 Пункты выдачи Ozon есть во многих городах</li>
              <li>💰 Стоимость рассчитывается индивидуально</li>
            </ul>
          </DeliveryOption> */}

          <DeliveryOption icon={Truck} title="СДЭК">
            <p>Доставка до ближайшего пункта выдачи или курьером прямо к вам домой.</p>
            <ul>
              <li>📍 Удобно в любом городе России</li>
              <li>💰 Стоимость выше, чем у 5Post и Ozon</li>
              <li>ℹ️ Требуются ФИО, телефон и адрес ПВЗ</li>
            </ul>
          </DeliveryOption>

          <DeliveryOption icon={Inbox} title="Почта России">
            <p>Доставка в любое отделение по стране</p>
            <ul>
              <li>💰 Цены выше, чем у 5Post</li>
              <li>ℹ️ Требуются ФИО, телефон и индекс/адрес отделения</li>
            </ul>
          </DeliveryOption>
          <DeliveryOption icon={ShoppingBag} title="Авито Доставка">
            <p>Если оформляете заказ через наш магазин на Авито:</p>
            <ul>
              <li>💬 Просто напишите нам — мы подготовим отправку через Авито</li>
              <li>📦 Упаковка, отправка и трек — всё под контролем платформы</li>
            </ul>
          </DeliveryOption>
          
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
        <div className="p-6 bg-white rounded-2xl shadow-sm">
  <h2 className="text-2xl font-bold text-center text-accent mb-2">Как оформить заказ</h2>
  <p className="text-center text-gray-600 mb-6">
    Всего несколько простых шагов — и ваш заказ уже в пути.
  </p>

  <div className="space-y-4">
    <HowToStep
      number={1}
      text="1. Откройте каталог и добавьте понравившиеся позиции в корзину."
    />
    <HowToStep
      number={2}
      text="2. Перейдите в корзину, проверьте состав заказа и нажмите «Оформить». Заполните форму с контактными данными."
    />
    <HowToStep
      number={3}
      text="3. Мы свяжемся с вами в Telegram, уточним детали и подтвердим заказ."
    />
    <HowToStep
      number={4}
      text="4. После подтверждения заказа пришлём реквизиты для оплаты (доставка рассчитывается отдельно)."
    />
    <HowToStep
      number={5}
      text="Если выбрана Авито Доставка — отправим через платформу, отслеживание доступно в аккаунте Авито."
    />
    <HowToStep
      number={6}
      text="При другом способе — передадим заказ в службу доставки в течение 1–5 рабочих дней и вышлем трек-номер."
    />
  </div>
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