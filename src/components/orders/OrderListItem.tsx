// components/orders/OrderListItem.tsx
"use client";

import { OrderWooCommerce } from "@/types";
import { useNavigation } from "@/context/NavigationContext";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface OrderListItemProps {
  order: OrderWooCommerce;
}

// Функция для перевода и стилизации статусов
const getStatusInfo = (status: string): { text: string; className: string } => {
  // Проверка на случай, если status придет как undefined или null
  const safeStatus = status || 'unknown';

  switch (safeStatus.toLowerCase()) {
    case 'processing':
      return { text: 'В обработке', className: 'bg-blue-100 text-blue-800' };
    case 'pending':
      return { text: 'Ожидает оплаты', className: 'bg-yellow-100 text-yellow-800' };
    case 'on-hold':
      return { text: 'На удержании', className: 'bg-yellow-100 text-yellow-800' };
    case 'completed':
      return { text: 'Выполнен', className: 'bg-green-100 text-green-800' };
    case 'cancelled':
      return { text: 'Отменен', className: 'bg-red-100 text-red-800' };
    case 'refunded':
      return { text: 'Возвращен', className: 'bg-gray-100 text-gray-800' };
    case 'failed':
      return { text: 'Не удался', className: 'bg-red-100 text-red-800' };
    default:
      return { text: safeStatus, className: 'bg-gray-100 text-gray-800' };
  }
};

export default function OrderListItem({ order }: OrderListItemProps) {
  const { push } = useNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Добавим проверку на случай, если `order` все же придет как undefined
  if (!order) {
    return null; // Просто не рендерим ничего, если нет данных
  }

  const handleNavigate = () => {
    const currentPath = `${pathname}?${searchParams.toString()}`;
    const newPath = `/orders/${order.id}`;
    push(newPath);
  };
  
  const statusInfo = getStatusInfo(order.status);

  return (
    <button
      onClick={handleNavigate}
      className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-left"
    >
      <div className="flex flex-col gap-1">
        <span className="font-bold text-md text-main-text">Заказ №{order.id}</span>
        <span className="text-sm text-gray-500">
          от {new Date(order.date_created).toLocaleDateString('ru-RU')}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className={`font-semibold px-2 py-1 text-xs rounded-full ${statusInfo.className}`}>
          {statusInfo.text}
        </span>
        <span className="font-semibold text-main-text hidden sm:block">{order.total} {order.currency}</span>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </button>
  );
}