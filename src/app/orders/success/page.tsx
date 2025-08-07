// app/orders/success/page.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import { CircleCheck } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Suspense, useEffect } from 'react';
import Spinner from '@/components/ui/Spinner';
import { motion } from 'framer-motion'; // Импортируем framer-motion
import { useTelegram } from '@/hooks/useTelegram';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';
import { useNavigation } from '@/context/NavigationContext'; // Наша навигация


function SuccessContent() {
    const { push } = useNavigation();

    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { webApp } = useTelegram();
    const { setupBackButton, hideMainButton } = useTelegramButtons();

    // Отключаем нативные кнопки, т.к. на этой странице они не нужны
    useEffect(() => {
        setupBackButton(false);
        hideMainButton();
    }, [setupBackButton, hideMainButton]);

    // Даем тактильный отклик при загрузке страницы
    useEffect(() => {
        webApp?.HapticFeedback.notificationOccurred('success');
    }, [webApp]);
     // --- ОБРАБОТЧИКИ НАВИГАЦИИ ---
     const handleNavigate = (newPath: string) => {
        // Мы НЕ сохраняем страницу успеха в истории.
        // Мы просто переходим на новую страницу.
        // Это имитирует `router.replace` и "ломает" историю,
        // не позволяя вернуться сюда кнопкой "Назад".
        push(newPath); // Передаем пустую строку, чтобы не добавлять /success в историю
    };

    return (
        // Используем min-h-screen и flex, чтобы центрировать контент на всю высоту экрана
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
            {/* Анимированная галочка */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.2
                }}
            >
                <CircleCheck size={80} className="text-green-500 mb-6" />
            </motion.div>
            
            {/* Анимированный текст */}
            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-3xl font-bold"
            >
                Спасибо за ваш заказ!
            </motion.h1>

            {orderId && (
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-lg mt-2"
                >
                    Номер вашего заказа: <strong>#{orderId}</strong>
                </motion.p>
            )}

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-gray-500 mt-2 max-w-md"
            >
                Мы скоро свяжемся с вами для подтверждения заказа.
                <br />
                Детали заказа вы можете посмотреть в разделе "Мои заказы".
            </motion.p>
            
            {/* Кнопки с отступом */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="mt-10 w-full max-w-xs space-y-3" // Увеличили верхний отступ и добавили space-y-3
            >
                <Button onClick={() => handleNavigate('/orders')} variant='primary'>Посмотреть мои заказы</Button>
                <Button onClick={() => handleNavigate('/')} variant='secondary'>Вернуться на главную</Button>
            </motion.div>
        </div>
    );
}

export default function OrderSuccessPage() {
    // Обертка Suspense должна быть здесь для правильной работы useSearchParams
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Spinner/></div>}>
            <SuccessContent />
        </Suspense>
    )
}