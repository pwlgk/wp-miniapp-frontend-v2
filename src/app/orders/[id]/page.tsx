// app/orders/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getMyOrderById } from '@/services/api';
import { OrderWooCommerce, OrderLineItem } from '@/types';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Image from 'next/image';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';
import { useNavigation } from '@/context/NavigationContext';
import { usePathname, useSearchParams } from 'next/navigation';
import { getStatusInfo } from '@/utils/statusUtils'; // Импортируем нашу утилиту
import { useTelegram } from '@/hooks/useTelegram'; // Убедитесь, что это ваш хук

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderWooCommerce | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setupBackButton, hideMainButton } = useTelegramButtons();
  const { initData } = useTelegram(); // 1. Получаем initData

  const { push } = useNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setupBackButton(true);
    hideMainButton();
  }, [setupBackButton, hideMainButton]);

  useEffect(() => {
    if (!params.id || !initData) return; // Добавляем проверку на initData
    const fetchOrder = async () => {
      try {
        const data = await getMyOrderById(params.id, initData);
        setOrder(data);
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить данные заказа");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [params.id]);

  const handleProductClick = (productId: number) => {
    const currentPath = `${pathname}?${searchParams.toString()}`;
    const newPath = `/products/${productId}`;
    push(newPath);
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!order) return <ErrorMessage message="Заказ не найден." />;

  // Получаем информацию о статусе
  const statusInfo = getStatusInfo(order.status);
  
  // Вычисляем сумму до скидки
  const subTotal = parseFloat(order.total) + parseFloat(order.discount_total);

  return (
    <div className="p-4 space-y-6">
      {/* Шапка */}
      <div>
        <h1 className="text-2xl font-bold">Детали заказа №{order.id}</h1>
        <p className="text-sm text-gray-500">
          от {new Date(order.date_created).toLocaleDateString('ru-RU', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* Информация о заказе */}
      <div className="p-4 bg-white rounded-xl shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Статус:</span>
          {/* Используем нашу функцию для стилизации и перевода */}
          <span className={`font-semibold px-2 py-1 text-xs rounded-full ${statusInfo.className}`}>
            {statusInfo.text}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Получатель:</span>
          <span className="font-semibold">{order.billing.first_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Телефон:</span>
          <span className="font-semibold">{order.billing.phone}</span>
        </div>
        {/* Отображение примечания клиента, если оно есть */}
        {order.customer_note && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600">Примечание:</p>
            <p className="text-sm italic">"{order.customer_note}"</p>
          </div>
        )}
      </div>

      {/* Финансовая информация */}
      <div className="p-4 bg-white rounded-xl shadow-sm space-y-2">
         <div className="flex justify-between text-md">
          <span>Сумма товаров:</span>
          <span>{subTotal.toFixed(2)} {order.currency}</span>
        </div>
        {parseFloat(order.discount_total) > 0 && (
          <div className="flex justify-between text-md text-green-600">
            <span>Скидка ({order.coupon_lines[0]?.code}):</span>
            <span>- {parseFloat(order.discount_total).toFixed(2)} {order.currency}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
          <span>Итого:</span>
          <span>{order.total} {order.currency}</span>
        </div>
      </div>
      
      {/* Состав заказа */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Состав заказа</h2>
        <div className="space-y-3">
          {order.line_items.map((item: OrderLineItem) => (
            <button 
              onClick={() => handleProductClick(item.product_id)} 
              key={item.id} 
              className="w-full flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                {item.image?.src && (
                  <Image src={item.image.src} alt={item.name} width={64} height={64} className="object-cover" />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-semibold truncate">{item.name}</p>
                <p className="text-sm text-gray-500">{item.quantity} шт. × {item.price} {order.currency}</p>
              </div>
              <p className="font-semibold text-right">{item.total} {order.currency}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}