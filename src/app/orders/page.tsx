// app/orders/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getMyOrders } from '@/services/api';
import { OrderWooCommerce } from '@/types';
import { useNavigation } from '@/context/NavigationContext';
import { usePathname, useSearchParams } from 'next/navigation';

import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
// --- ИЗМЕНЕНИЕ: Импортируем OrderListItem из отдельного файла ---
import OrderListItem from '@/components/orders/OrderListItem'; 
import { ShoppingBag } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<OrderWooCommerce[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setupBackButton, hideMainButton } = useTelegramButtons();
  
  const { push } = useNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setupBackButton(true);
    hideMainButton();
  }, [setupBackButton, hideMainButton]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()));
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить историю заказов");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleGoShopping = () => {
    const currentPath = `${pathname}?${searchParams.toString()}`;
    push('/');
  }

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error) return <ErrorMessage message={error} />;

  if (orders.length === 0) {
    // ... (без изменений) ...
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Мои заказы</h1>
      <div className="space-y-3">
        {orders.map(order => (
          // Теперь этот компонент стабилен и надежно получает пропсы
          <OrderListItem key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}