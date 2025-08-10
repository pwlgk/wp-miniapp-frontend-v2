// components/cart/CartItemCard.tsx
"use client";

import { memo } from 'react';
import { Product } from '@/types';
import { CartItem } from '@/services/api';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useNotifier } from '@/hooks/useNotifier';
import { useNavigation } from '@/context/NavigationContext';
import { usePathname, useSearchParams } from 'next/navigation';

interface CartItemCardProps {
  // `productDetails` теперь обязателен
  item: CartItem;
  productDetails: Product; 
}

const CartItemCard = memo(function CartItemCard({ item, productDetails }: CartItemCardProps) {
  const { dispatch } = useCart();
  const { notify } = useNotifier();
  const { push } = useNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleQuantityChange = (newQuantity: number) => {
    // Не позволяем установить количество меньше 1
    if (newQuantity < 1) return;
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId: item.product_id, quantity: newQuantity } });
  };

  const handleRemove = () => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId: item.product_id } });
  };
  
  const handleIncrement = () => {
    if (productDetails.stock_quantity !== null && item.quantity >= productDetails.stock_quantity) {
      notify(`Больше нет в наличии. Доступно: ${productDetails.stock_quantity} шт.`, 'error');
      return;
    }
    handleQuantityChange(item.quantity + 1);
  };

  // --- НОВЫЙ ОБРАБОТЧИК ДЛЯ НАВИГАЦИИ ---
  const handleNavigate = () => {
    const currentPath = `${pathname}?${searchParams.toString()}`;
    push(`/products/${productDetails.id}`);
  };
  
  // Заглушка больше не нужна, так как productDetails всегда будет передан
  
  const imageUrl = productDetails.images?.[0]?.src || '/placeholder.png';
  const canIncrement = productDetails.stock_quantity === null || item.quantity < productDetails.stock_quantity;

  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
      {/* Кликабельная картинка */}
      <button onClick={handleNavigate} className="flex-shrink-0 focus:outline-none">
        <Image src={imageUrl} alt={productDetails.name} width={80} height={80} className="rounded-lg object-cover" />
      </button>

      <div className="flex-grow min-w-0">
        {/* Кликабельное название */}
        <button onClick={handleNavigate} className="text-left">
          <h3 className="font-bold hover:text-accent transition-colors">{productDetails.name}</h3>
        </button>
        <p className="text-lg font-semibold mt-1">{productDetails.price} ₽</p>
        {productDetails.stock_quantity !== null && item.quantity >= productDetails.stock_quantity && (
          <p className="text-xs text-red-500 font-semibold mt-1">Вы выбрали всё, что есть</p>
        )}
      </div>

      {/* Правая часть с управлением */}
      <div className="flex flex-col items-end justify-between h-full">
        
        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => handleQuantityChange(item.quantity - 1)} disabled={item.quantity <= 1} className="p-2 rounded-full bg-gray-200 disabled:opacity-50">
            <Minus size={16}/>
          </button>
          <span className="font-bold w-8 text-center">{item.quantity}</span>
          <button 
            onClick={handleIncrement} 
            disabled={!canIncrement}
            className="p-2 rounded-full bg-gray-200 disabled:opacity-50"
          >
            <Plus size={16}/>
          </button>
        </div><br /><br />
        <button onClick={handleRemove} className="text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
});

export default CartItemCard;