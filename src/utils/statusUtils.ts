// utils/statusUtils.ts
export const getStatusInfo = (status: string): { text: string; className: string } => {
    const safeStatus = status || 'unknown';
  
    switch (safeStatus.toLowerCase()) {
      case 'processing': return { text: 'В обработке', className: 'bg-blue-100 text-blue-800' };
      case 'pending': return { text: 'Ожидает оплаты', className: 'bg-yellow-100 text-yellow-800' };
      case 'on-hold': return { text: 'На удержании', className: 'bg-yellow-100 text-yellow-800' };
      case 'completed': return { text: 'Выполнен', className: 'bg-green-100 text-green-800' };
      case 'cancelled': return { text: 'Отменен', className: 'bg-red-100 text-red-800' };
      case 'refunded': return { text: 'Возвращен', className: 'bg-gray-100 text-gray-800' };
      case 'failed': return { text: 'Не удался', className: 'bg-red-100 text-red-800' };
      default: return { text: safeStatus, className: 'bg-gray-100 text-gray-800' };
    }
  };