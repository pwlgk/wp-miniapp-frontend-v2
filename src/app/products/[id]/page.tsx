// app/products/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react'; 
import { getProductById } from '@/services/api';
import { Product } from '@/types';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import AddToCart from '@/components/products/AddToCart';
import ProductImageCarousel from '@/components/products/ProductImageCarousel';
import CategoryBadges from '@/components/products/CategoryBadges';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';
import { useTelegram } from '@/hooks/useTelegram';

// --- ИСПРАВЛЕНИЕ 1: Типизируем `props` как `any`, чтобы обойти ошибку сборки ---
export default function ProductDetailPage(props: any) {
  
  // --- ИЗВЛЕКАЕМ `params` С ПРАВИЛЬНЫМ ТИПОМ ВНУТРИ КОМПОНЕНТА ---
  const params: { id: string } = props.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setupBackButton, hideMainButton } = useTelegramButtons();
  const { initData } = useTelegram();

  useEffect(() => {
    setupBackButton(true);
    hideMainButton();
  }, [setupBackButton, hideMainButton]);

  useEffect(() => {
    // Используем `params.id` напрямую
    // Теперь getProductById не требует initData, так как это публичный эндпоинт
    if (!params.id) return;
    
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await getProductById(params.id); // Убираем initData отсюда
        setProduct(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
            setError(e.message || "Не удалось загрузить товар");
        } else {
            setError("Неизвестная ошибка");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  // Зависимость теперь только от params.id
  }, [params.id]); 

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <ErrorMessage message="Товар не найден." />;

  return (
    <div className="space-y-6">
      <ProductImageCarousel images={product.images} productName={product.name} />
      <div className="p-4 space-y-4">
        {/* Категории и Артикул */}
        <div className="flex justify-between items-center">
          <CategoryBadges categories={product.categories} />
          {/* --- ИЗМЕНЕНИЕ 2: Отображаем артикул, если он есть --- */}
          {product.sku && (
            <span className="text-xs text-gray-400 font-mono">
              АРТ: {product.sku}
            </span>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-main-text">{product.name}</h1>
        
        <p className="text-4xl font-extrabold text-main-text">
          {product.price} ₽
        </p>
        
        {product.description && (
          <div className="pt-4 space-y-2">
            <h2 className="text-lg font-bold">Описание</h2>
            <div 
              className="prose prose-sm max-w-none text-main-text"
              dangerouslySetInnerHTML={{ __html: product.description }} 
            />
          </div>
        )}
        
        <div className="pt-6">
          <AddToCart product={product} />
        </div>
      </div>
    </div>
  );
}