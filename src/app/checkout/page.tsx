// app/checkout/page.tsx
"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { usePathname,  useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { getMyInfo, createOrder } from '@/services/api';
import { OrderPayload } from '@/types';
import { useTelegram } from '@/context/TelegramContext';

// Компоненты UI
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';
import { useNavigation } from '@/context/NavigationContext';

// Компонент поля ввода (без изменений, вынесен)
const InputField = ({ label, error, ...props }: { label: string, error?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input 
      {...props}
      className={`w-full h-12 px-4 rounded-lg bg-gray-100 border transition-colors ${
        error 
        ? 'border-red-500 focus:border-red-500' 
        : 'border-gray-300 focus:border-accent'
      } focus:ring-0`}
    />
    {error && <div className="mt-2 text-sm text-red-700 bg-red-100 p-2 rounded-md">{error}</div>}
  </div>
);

function CheckoutPageContent() {

  const { push } = useNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { webApp, initData } = useTelegram(); // 1. Получаем initData

  // --- ИЗМЕНЕНИЕ 1: Объединяем состояния ---
  const [state, setState] = useState({
    formData: { first_name: '', phone: '', city: '', customer_note: '' }, // Добавляем customer_note
    formErrors: { first_name: '', phone: '' },
    isInitialLoading: true,
    isPlacingOrder: false,
    globalError: null as string | null,
  });

  // --- ИЗМЕНЕНИЕ 2: Используем `useCallback` для стабильности ---
  const couponCode = useCallback(() => searchParams.get('coupon'), [searchParams]);
  const totalAmount = useCallback(() => searchParams.get('total'), [searchParams]);

  const { setupBackButton, hideMainButton } = useTelegramButtons();

  useEffect(() => {
    setupBackButton(true);
    hideMainButton();
  }, [setupBackButton, hideMainButton]);

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        const data = await getMyInfo(initData); // 2. Передаем в getMyInfo
        setState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            first_name: data.first_name || '',
            phone: data.billing?.phone || '',
            city: data.billing?.city || '',
          },
          isInitialLoading: false,
        }));
      } catch (e) {
        console.error("Не удалось предзаполнить данные", e);
        setState(prev => ({ ...prev, isInitialLoading: false }));
      }
    };
    fetchCustomerInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState(prev => {
      const newFormData = { ...prev.formData, [name]: value };
      const newFormErrors = { ...prev.formErrors, [name]: '' }; // Сбрасываем ошибку при изменении
      return { ...prev, formData: newFormData, formErrors: newFormErrors };
    });
  };

  const validateForm = (): boolean => {
    const { formData } = state;
    const errors = { first_name: '', phone: '' };
    let isValid = true;

    if (!formData.first_name.trim()) {
      errors.first_name = "Имя обязательно для заполнения.";
      isValid = false;
    }

    const phoneRegex = /^(?:\+7|8|9)\d{10}$/;
    if (!formData.phone.trim()) {
      errors.phone = "Телефон обязателен для заполнения.";
      isValid = false;
    } else if (!phoneRegex.test(formData.phone.replace(/[\s-()]/g, ''))) {
      errors.phone = "Неверный формат номера телефона.";
      isValid = false;
    }

    setState(prev => ({ ...prev, formErrors: errors }));
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (cartState.items.length === 0) {
      setState(prev => ({ ...prev, globalError: "Ваша корзина пуста. Невозможно оформить заказ." }));
      return;
    }
    setState(prev => ({ ...prev, isPlacingOrder: true, globalError: null }));

    try {
      // --- ИЗМЕНЕНИЕ 3: Собираем новый payload ---
      const payload: OrderPayload = {
        line_items: cartState.items.map(({ product_id, quantity }) => ({ product_id, quantity })),
        billing: {
          first_name: state.formData.first_name, // Добавляем имя
          phone: state.formData.phone,
          city: state.formData.city,
        },
        customer_note: state.formData.customer_note, // Добавляем примечание
      };
      
      const currentCoupon = couponCode();
      if (currentCoupon) {
        payload.coupon_code = currentCoupon;
      }
      const createdOrder = await createOrder(payload, initData);

      webApp?.HapticFeedback.notificationOccurred('success');
      cartDispatch({ type: 'CLEAR_CART' });
      
      // --- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ ---
      // Вместо router.replace используем наш push.
      // `currentPath` - это страница checkout, которую мы хотим сохранить в истории
      // на случай, если пользователь захочет вернуться со страницы успеха.
      const currentPath = `${pathname}?${searchParams.toString()}`;
      const newPath = `/orders/success?orderId=${createdOrder.id}`;
      push(newPath);

    } catch (e: any) {
      setState(prev => ({ ...prev, globalError: e.message || "Произошла ошибка." }));
      webApp?.HapticFeedback.notificationOccurred('error');
    } finally {
      setState(prev => ({ ...prev, isPlacingOrder: false }));
    }
  };
  
  const isButtonDisabled = state.isPlacingOrder || cartState.items.length === 0;

  if (state.isInitialLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Оформление заказа</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Ваше имя" name="first_name" value={state.formData.first_name} onChange={handleChange} required placeholder="Иван Иванов" error={state.formErrors.first_name} />
        <InputField label="Телефон" name="phone" type="tel" value={state.formData.phone} onChange={handleChange} required placeholder="+7 (999) 123-45-67" error={state.formErrors.phone} />
        <InputField label="Город" name="city" value={state.formData.city} onChange={handleChange} placeholder="Москва" />
        
        {/* --- НОВОЕ: Поле для примечания --- */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Примечание к заказу (необязательно)</label>
            <textarea
                name="customer_note"
                value={state.formData.customer_note}
                onChange={handleChange}
                rows={3}
                placeholder="Примечание к заказу (необязательно)"
                className="w-full p-4 rounded-lg bg-gray-100 border border-gray-300 focus:border-accent focus:ring-0"
            />
        </div>
        
        <div className="p-4 bg-gray-100 rounded-lg text-lg flex justify-between font-bold">
          <span>К оплате:</span>
          {/* --- ИЗМЕНЕНИЕ 4: Вызываем функцию для получения значения --- */}
          <span>{totalAmount() ? `${totalAmount()} ₽` : '...'}</span>
        </div>
        
        {state.globalError && <ErrorMessage message={state.globalError} />}
        
        <div className="pt-4">
          <Button type="submit" disabled={isButtonDisabled}>
            {state.isPlacingOrder ? 'Создаем заказ...' : 'Подтвердить заказ'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spinner /></div>}>
            <CheckoutPageContent />
        </Suspense>
    )
}