// app/info/about/page.tsx
"use client";

import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useNavigation } from '@/context/NavigationContext';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';
import { Diamond, Heart, Sparkles } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Массив с нашими преимуществами для удобства
const features = [
  {
    icon: Diamond,
    title: "Качество в деталях",
    text: "Мы тщательно отбираем каждый материал и следим за качеством исполнения, чтобы аксессуар радовал вас долгие годы."
  },
  {
    icon: Heart,
    title: "Уникальный ассортимент",
    text: "Многие наши изделия выпускаются ограниченным тиражом. Вы не найдете их в обычных магазинах."
  },
  {
    icon: Sparkles,
    title: "Современный стиль",
    text: "Мы следим за трендами и создаем аксессуары, которые идеально дополнят любой ваш образ."
  }
];

export default function AboutPage() {
  const { push } = useNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setupBackButton, hideMainButton } = useTelegramButtons();

  useEffect(() => {
    setupBackButton(true);
    hideMainButton();
  }, [setupBackButton, hideMainButton]);

  const handleNavigateToCatalog = () => {
    const currentPath = `${pathname}?${searchParams.toString()}`;
    push('/catalog');
  };

  return (
    <div className="bg-main-bg">
      {/* 1. Главный баннер (Hero Image) */}
      <div className="relative w-full h-48">
        <Image
          src="/images/about-hero.jpg"
          alt="О магазине"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-3xl font-bold text-white text-center drop-shadow-lg">
            Наша история в каждом аксессуаре
          </h1>
        </div>
      </div>
      
      <div className="p-4 space-y-8">
        {/* 2. Блок "Наша философия" */}
        <div className="p-6 bg-secondary rounded-2xl text-center">
          <p className="text-lg italic text-main-text">
            "Мы верим, что стиль кроется в деталях. Поэтому каждый наш аксессуар — это больше, чем просто вещь. Это частичка заботы и красоты, созданная для вас."
          </p>
        </div>

        {/* --- НОВЫЙ БЛОК: Подробная информация --- */}
        <div className="p-6 bg-white rounded-2xl shadow-sm">
          <div className="prose prose-sm max-w-none">
            <h2>Кто мы?</h2>
            <p>
              <strong>Kosynka Store</strong> — это не просто магазин, а небольшая команда энтузиастов, влюбленных в красивые и качественные вещи. Мы начали свой путь с желания найти идеальные аксессуары для себя, а теперь делимся нашими находками с вами.
            </p>
            <h2>Что мы предлагаем?</h2>
            <p>
              Наш ассортимент включает в себя все, что нужно для завершения вашего образа: от элегантных шелковых платков и уютных косынок до стильных заколок-крабов. Мы постоянно находимся в поиске новых, интересных моделей, чтобы вы могли выразить свою индивидуальность.
            </p>
            <h2>Наша миссия</h2>
            <p>
              Мы хотим, чтобы каждая женщина чувствовала себя уверенной и прекрасной. Наши аксессуары — это простой и доступный способ добавить изюминку в повседневный образ, поднять настроение и подчеркнуть вашу уникальность.
            </p>
          </div>
        </div>
        
        {/* 3. Основные тезисы ("Почему выбирают нас?") */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Наши преимущества</h2>
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="text-gray-600">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 4. Кнопка призыва к действию */}
        <div className="pt-4">
          <Button onClick={handleNavigateToCatalog} variant="primary">
            Перейти в каталог
          </Button>
        </div>
      </div>
    </div>
  );
}