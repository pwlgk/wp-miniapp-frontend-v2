// components/products/AddToCart.tsx
"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import Button from '../ui/Button';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useNotifier } from '@/hooks/useNotifier';
import { useTelegram } from '@/hooks/useTelegram';

interface AddToCartProps {
  product: Product;
}

export default function AddToCart({ product }: AddToCartProps) {
  const { state, dispatch } = useCart();
  const { notify } = useNotifier();
  const { webApp } = useTelegram();
  const [quantity, setQuantity] = useState(1);
  
  const maxStockQuantity = product.stock_quantity ?? Infinity;
  const quantityInCart = state.items.find(item => item.product_id === product.id)?.quantity || 0;
  const maxQuantityToAdd = maxStockQuantity - quantityInCart;


  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => {
      const newQuantity = prev + amount;
      if (newQuantity < 1) return 1;
      if (newQuantity > maxQuantityToAdd) {
        if (maxQuantityToAdd > 0) {
            notify(`Можно добавить еще ${maxQuantityToAdd} шт.`, 'info');
            return maxQuantityToAdd;
        }
        return prev; // Если добавить больше нельзя, не меняем значение
      }
      return newQuantity;
    });
  };

  const handleAddToCart = () => {
    if (quantity > maxQuantityToAdd) {
      notify(`Нельзя добавить ${quantity} шт. В корзину можно добавить еще ${maxQuantityToAdd}.`, 'error');
      return;
    }

    // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
    // Формируем payload в точности как ожидает reducer.
    // Мы передаем только необходимые данные для создания/обновления
    // элемента корзины, а CartContext уже обогатит его остальными данными.
    dispatch({
      type: 'ADD_ITEM',
      payload: { 
        product_id: product.id,
        quantity: quantity,
        // Обогащаем объект данными, которые понадобятся для отображения
        // в корзине, не дожидаясь синхронизации с сервером
        name: product.name,
        price: product.price,
        image_url: product.images?.[0]?.src || '',
        stock_quantity: product.stock_quantity,
        stock_status: product.stock_status,
      }
    });

    webApp?.HapticFeedback.notificationOccurred('success');
    notify(`"${product.name}" (${quantity} шт.) добавлен в корзину!`, 'success');
  };

  if (product.stock_status !== 'instock' || maxQuantityToAdd <= 0) {
    return (
      <div className="p-3 text-center bg-gray-100 dark:bg-dark-secondary rounded-lg text-gray-500 font-semibold">
        {maxQuantityToAdd <= 0 && product.stock_status === 'instock' ? 'Все в корзине' : 'Нет в наличии'}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-4">
      <div className="flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg">
        <button 
          onClick={() => handleQuantityChange(-1)} 
          className="p-3 disabled:opacity-50"
          disabled={quantity <= 1}
        >
          <Minus size={16} />
        </button>
        <span className="px-4 font-bold text-lg w-16 text-center">{quantity}</span>
        <button 
          onClick={() => handleQuantityChange(1)} 
          className="p-3 disabled:opacity-50"
          disabled={quantity >= maxQuantityToAdd}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-grow">
        <Button onClick={handleAddToCart} variant="secondary" className="h-full flex items-center justify-center gap-2">
          <ShoppingCart size={20} />
          <span>В корзину</span>
        </Button>
      </div>
    </div>
  );
}