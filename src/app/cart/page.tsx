// app/cart/page.tsx
"use client";

import { useCart } from '@/context/CartContext';
import { getProducts, validateCoupon } from '@/services/api';
import { Product, CouponValidationResponse } from '@/types';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useNotifier } from '@/hooks/useNotifier';
import { usePathname, useSearchParams } from 'next/navigation'; // Импортируем для получения текущего URL
import { useNavigation } from '@/context/NavigationContext';
// Компоненты UI
import CartItemCard from '@/components/cart/CartItemCard';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { ShoppingCart, TicketPercent, AlertCircle, ChevronDown } from 'lucide-react';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';
import { motion, AnimatePresence } from 'framer-motion'; // Импортируем для анимации

const MIN_ORDER_AMOUNT = 500;

export default function CartPage() {
  const { state } = useCart();
  const { items, isInitialized } = state;
  const { notify } = useNotifier();
  const { push } = useNavigation(); // Используем наш хук
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [productDetails, setProductDetails] = useState<Product[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [stockMessages, setStockMessages] = useState<string[]>([]);
  const [isCouponPanelOpen, setIsCouponPanelOpen] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  const productIdsString = useMemo(() => {
    return items.map(item => item.product_id).sort().join(',');
  }, [items]);
  
  const { setupBackButton, hideMainButton } = useTelegramButtons();

  useEffect(() => {
    setupBackButton(true);
    hideMainButton();
  }, [setupBackButton, hideMainButton]);

  useEffect(() => {
    const fetchAndCheckDetails = async () => {
      if (!productIdsString) {
        setProductDetails([]);
        setStockMessages([]);
        setIsLoadingDetails(false);
        return;
      }
      setIsLoadingDetails(true);
      try {
        const { products } = await getProducts({ include: productIdsString, per_page: 100 });
        setProductDetails(products);

        const messages: string[] = [];
        items.forEach(item => {
          const detail = products.find(p => Number(p.id) === Number(item.product_id));
          
          if (!detail) {
            messages.push(`Товар с ID ${item.product_id} больше не доступен и будет удален из корзины.`);
          } else if (detail.stock_quantity !== null && item.quantity > detail.stock_quantity) {
            messages.push(`Внимание: товара "${detail.name}" в наличии только ${detail.stock_quantity} шт.`);
          }
        });
        setStockMessages(messages);
        
        if (messages.length > 0) {
            notify("Обнаружены проблемы с наличием товаров в корзине!", 'error');
        }

      } catch (error) {
        console.error("Failed to fetch product details for cart", error);
        notify("Не удалось проверить наличие товаров.", "error");
      } finally {
        setIsLoadingDetails(false);
      }
    };

    if (isInitialized) {
      fetchAndCheckDetails();
    }
  }, [productIdsString, isInitialized, items.length, notify]);

  const subTotalPrice = useMemo(() => {
    return items.reduce((total, item) => {
      const product = productDetails.find(p => Number(p.id) === Number(item.product_id));
      return total + (product ? parseFloat(product.price) * item.quantity : 0);
    }, 0);
  }, [items, productDetails]);

  const { totalPrice, discountAmount } = useMemo(() => {
    let discount = 0;
    if (appliedCoupon && appliedCoupon.valid && appliedCoupon.amount) {
      if (appliedCoupon.discount_type === 'percent') {
        discount = subTotalPrice * (parseFloat(appliedCoupon.amount) / 100);
      } else if (appliedCoupon.discount_type === 'fixed_cart') {
        discount = parseFloat(appliedCoupon.amount);
      }
    }
    const finalPrice = Math.max(0, subTotalPrice - discount);
    return { totalPrice: finalPrice, discountAmount: discount };
  }, [subTotalPrice, appliedCoupon]);
  
  const isMinAmountReached = totalPrice >= MIN_ORDER_AMOUNT;

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setIsCouponLoading(true);
    setAppliedCoupon(null);
    try {
      const result = await validateCoupon(couponInput);
      if (result.valid) {
        setAppliedCoupon(result);
        notify(`Промокод ${result.code} успешно применен!`, 'success');
        setCouponInput('');
      } else {
        notify(result.message || "Неверный промокод", 'error');
      }
    } catch (error) {
      notify("Ошибка при проверке промокода. Попробуйте позже.", 'error');
    }
    setIsCouponLoading(false);
  };
  
  const canProceedToCheckout = isMinAmountReached && items.length > 0 && stockMessages.length === 0;

  if (!isInitialized) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }
  
  const handleProceedToCheckout = () => {
    const currentPath = `${pathname}?${searchParams.toString()}`;
    const newPath = `/checkout?coupon=${appliedCoupon?.code || ''}&total=${totalPrice.toFixed(2)}`;
    push(newPath);
  };

  // --- НОВЫЙ ОБРАБОТЧИК ДЛЯ "НАЧАТЬ ПОКУПКИ" ---
  const handleStartShopping = () => {
      const currentPath = `${pathname}?${searchParams.toString()}`;
      push('/');
  }

  if (!isInitialized) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }
  
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <ShoppingCart size={64} className="text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold">Ваша корзина пуста</h1>
        <p className="text-gray-500 mt-2">Самое время добавить что-нибудь интересное!</p>
        <div className="mt-6 w-full max-w-xs">
          {/* Используем onClick вместо Link */}
          <Button onClick={handleStartShopping} variant="secondary">Начать покупки</Button>
        </div>
      </div>
    );
  }


  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Корзина</h1>
      
      {stockMessages.length > 0 && (
        <div className="p-3 bg-red-100 text-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Пожалуйста, исправьте корзину:</p>
            {stockMessages.map((msg: string, i: number) => <p key={i} className="text-sm">{msg}</p>)}
          </div>
        </div>
      )}

      {isLoadingDetails ? (
        <div className="py-8"><Spinner /></div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const details = productDetails.find(p => Number(p.id) === Number(item.product_id));
            if (!details) return null; 

            return (
              <CartItemCard 
                key={item.product_id} 
                item={item} 
                productDetails={details} 
              />
            );
          })}
        </div>
      )}
      
      <div className="pt-4 border-t border-gray-200">
        {appliedCoupon ? (
            // Если купон уже применен, показываем его
            <div className="p-3 bg-green-100 text-green-800 rounded-lg flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <TicketPercent size={20}/>
                    <span className="font-semibold">Применен: <strong>{appliedCoupon.code}</strong></span>
                </div>
                <button onClick={() => setAppliedCoupon(null)} className="font-bold text-xs">Удалить</button>
            </div>
        ) : (
            // Если купона нет, показываем триггер
            <button 
              onClick={() => setIsCouponPanelOpen(!isCouponPanelOpen)}
              className="flex justify-between items-center w-full text-left p-3 rounded-lg hover:bg-gray-100 d"
            >
              <span className="font-semibold text-light-text dark:text-dark-text">Есть промокод?</span>
              <motion.div animate={{ rotate: isCouponPanelOpen ? 180 : 0 }}>
                <ChevronDown />
              </motion.div>
            </button>
        )}

        <AnimatePresence>
          {isCouponPanelOpen && !appliedCoupon && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: '0.75rem' }} // 12px
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto] gap-2">
                <input 
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Введите промокод..."
                  className="min-w-0 h-12 px-4 rounded-lg bg-gray-100 border-gray-300 focus:border-light-accent focus:ring-0"
                  disabled={isCouponLoading}
                />
                <Button 
                  onClick={handleApplyCoupon}  variant='secondary'
                  disabled={isCouponLoading || !couponInput} 
                >
                  {isCouponLoading ? <Spinner /> : 'Применить'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-4 space-y-2 border-t border-gray-200">
        <div className="flex justify-between text-md">
          <span>Сумма</span>
          <span>{subTotalPrice.toFixed(2)} ₽</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-md text-green-600">
            <span>Скидка</span>
            <span>- {discountAmount.toFixed(2)} ₽</span>
          </div>
        )}
        <div className="flex justify-between text-xl font-bold">
          <span>Итого:</span>
          <span>{totalPrice.toFixed(2)} ₽</span>
        </div>
        {!isMinAmountReached && (
          <p className="text-center text-red-500 pt-2">
            Минимальная сумма заказа: {MIN_ORDER_AMOUNT} ₽
          </p>
        )}
        
        <div className="pt-2">
           {/* Убираем Link и используем onClick на кнопке */}
           <Button onClick={handleProceedToCheckout} disabled={!canProceedToCheckout} variant="secondary">
             Оформить заказ
           </Button>
        </div>
      </div>
    </div>
  );
}