// app/products/[id]/page.tsx
"use client";

// Убираем `use` из импорта React
import { useState, useEffect } from 'react'; 
import { getProductById } from '@/services/api';
import { Product } from '@/types';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import AddToCart from '@/components/products/AddToCart';
import ProductImageCarousel from '@/components/products/ProductImageCarousel';
import CategoryBadges from '@/components/products/CategoryBadges';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';

// Возвращаем простой и понятный тип для params
export default function ProductDetailPage({ params }: { params: { id: string } }) {
  
  // Убираем логику с `use(params)`

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setupBackButton, hideMainButton } = useTelegramButtons();

  useEffect(() => {
    setupBackButton(true);
    hideMainButton();
  }, [setupBackButton, hideMainButton]);

  // Возвращаем useEffect к его первоначальному, рабочему виду
  useEffect(() => {
    // Используем `params.id` напрямую
    if (!params.id) return;
    
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await getProductById(params.id);
        setProduct(data);
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить товар");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  // Зависимость снова от `params.id`
  }, [params.id]); 

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <ErrorMessage message="Товар не найден." />;

  return (
    <div className="space-y-6">
      <ProductImageCarousel images={product.images} productName={product.name} />
      <div className="p-4 space-y-4">
        <CategoryBadges categories={product.categories} />
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