// context/CartContext.tsx
"use client";

import { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useRef } from 'react';
import { getMyCart, updateMyCart, ServerCartResponse, CartItem } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import { useTelegram } from '@/context/TelegramContext';
import Spinner from '@/components/ui/Spinner';

// --- 1. Определение типов ---

// Интерфейс для состояния нашего контекста
interface CartState {
  items: CartItem[];
  messages: string[];
  isInitialized: boolean; // Флаг, что корзина была хотя бы раз загружена с сервера
  isSyncing: boolean;     // Флаг, что идет процесс сохранения на сервер
}

// Все возможные экшены для нашего редьюсера
type Action =
  | { type: 'SET_CART'; payload: ServerCartResponse }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SYNCING'; payload: boolean };

// Тип для самого контекста, который мы будем экспортировать
interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<Action>;
}

// --- 2. Создание контекста ---
const CartContext = createContext<CartContextType | undefined>(undefined);

// --- 3. Редьюсер для управления состоянием ---
const cartReducer = (state: CartState, action: Action): CartState => {
  switch (action.type) {
    case 'SET_CART':
      return { 
        ...state, 
        items: action.payload.items, 
        messages: action.payload.messages, 
        isInitialized: true 
      };

    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.product_id === action.payload.product_id);
      if (existingItem) {
        // Товар уже есть: создаем новый массив, обновляя количество у существующего
        return {
          ...state,
          items: state.items.map(item =>
            item.product_id === action.payload.product_id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        // Новый товар: добавляем его в конец нового массива
        return {
          ...state,
          items: [...state.items, action.payload],
        };
      }
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        // Если количество <= 0, удаляем товар
        return { ...state, items: state.items.filter(item => item.product_id !== productId) };
      }
      // Обновляем количество для конкретного товара
      return {
        ...state,
        items: state.items.map(item =>
          item.product_id === productId ? { ...item, quantity: quantity } : item
        ),
      };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(item => item.product_id !== action.payload.productId) };

    case 'CLEAR_CART':
      // Этот экшен будет использоваться после успешного оформления заказа
      return { ...state, items: [] };

    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };

    default:
      // Лучше выбрасывать ошибку для неизвестных типов, чтобы избежать багов
      throw new Error(`Unhandled action type in cartReducer`);
  }
};

// --- 4. Компонент-провайдер ---
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { initData, isReady: isTelegramReady } = useTelegram();
  
    const [state, dispatch] = useReducer(cartReducer, {
      items: [],
      messages: [],
      isInitialized: false, // Мы все еще используем его, чтобы знать, когда показывать UI
      isSyncing: false,
    });
  
    // --- Используем useRef, чтобы избежать лишних перезапусков эффекта ---
    // Этот ref будет хранить флаг, что начальная загрузка уже произошла.
    const initialLoadHappened = useRef(false);
  
    // 1. Загрузка корзины с сервера
    useEffect(() => {
      // Этот эффект запускается только один раз, когда Telegram готов
      if (!isTelegramReady) return;
  
      const initializeCart = async () => {
        try {
          const serverCart = await getMyCart(initData);
          dispatch({ type: 'SET_CART', payload: serverCart });
        } catch (e) {
          console.error("Failed to initialize cart:", e);
          dispatch({ type: 'SET_CART', payload: { items: [], messages: ['Не удалось загрузить корзину.'] } });
        } finally {
          // Устанавливаем флаг, что загрузка завершена
          initialLoadHappened.current = true;
        }
      };
      
      initializeCart();
    }, [isTelegramReady]); // Зависимость ТОЛЬКО от isTelegramReady
  
    // 2. Отложенное сохранение на сервер
    const debouncedItems = useDebounce(state.items, 1500);
  
    useEffect(() => {
      // Этот эффект следит за debouncedItems
      const syncCartToServer = async () => {
        // НЕ сохраняем, если:
        // 1. Telegram не готов
        // 2. Первоначальная загрузка еще не завершилась (чтобы не отправить пустой массив по умолчанию)
        if (!isTelegramReady || !initialLoadHappened.current) {
          return;
        }
  
        dispatch({ type: 'SET_SYNCING', payload: true });
        try {
          // Мы передаем именно debouncedItems, т.к. state.items могут быть более свежими,
          // а мы хотим сохранить только "устаканившееся" состояние.
          await updateMyCart(debouncedItems, initData);
        } catch (e) {
          console.error("Cart sync failed:", e);
        } finally {
          dispatch({ type: 'SET_SYNCING', payload: false });
        }
      };
  
      syncCartToServer();
    }, [debouncedItems, isTelegramReady]); // Зависимость от debouncedItems и isTelegramReady
  
  
    return (
      <CartContext.Provider value={{ state, dispatch }}>
        {/* 
          Мы не рендерим дочерние компоненты, пока корзина не инициализирована.
          Это ГАРАНТИРУЕТ, что CartPage и другие компоненты не получат пустое состояние
          во время гидратации. Они просто подождут.
        */}
        {state.isInitialized ? children : <div className="flex justify-center items-center h-screen"><Spinner /></div>}
      </CartContext.Provider>
    );
  };
// --- 5. Кастомный хук для использования контекста ---
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};