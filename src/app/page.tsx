// app/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation'; // Импортируем хуки
import { getCategories, getProducts } from '@/services/api';
import { Category, Product } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';
import { useNavigation } from '@/context/NavigationContext'; // Наша навигация

// Импорт UI компонентов
import SearchBar from '@/components/home/SearchBar';
import CategoryCarousel from '@/components/home/CategoryCarousel';
import ProductList from '@/components/ProductList';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { push } = useNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setupBackButton, hideMainButton } = useTelegramButtons();

  useEffect(() => {
    // На главной кнопка "Назад" не нужна
    setupBackButton(false); 
    hideMainButton();
  }, [setupBackButton, hideMainButton]);

  // 1. Загрузка категорий (выполняется один раз при монтировании)
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (e: any) {
        // Ошибку категорий можно не показывать пользователю, чтобы не портить главный экран
        console.error("Failed to load categories:", e.message);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // 2. Функция для загрузки популярных товаров (по умолчанию)
  const fetchPopularProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      setError(null);
      const { products: popularProducts } = await getProducts({ per_page: 6, orderby: 'popularity' });
      setProducts(popularProducts);
    } catch (e: any) {
      setError(e.message || 'Не удалось загрузить популярные товары');
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // 3. Функция для поиска товаров
  const searchProducts = useCallback(async (query: string) => {
    try {
      setIsLoadingProducts(true);
      setError(null);
      const { products: searchResult } = await getProducts({ per_page: 6, search: query });
      setProducts(searchResult);
    } catch (e: any) {
      setError(e.message || 'Ошибка при поиске');
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // 4. Основной useEffect, который решает, что делать: искать или показывать популярное
  useEffect(() => {
    if (debouncedSearchQuery) {
      searchProducts(debouncedSearchQuery);
    } else {
      fetchPopularProducts();
    }
  }, [debouncedSearchQuery, fetchPopularProducts, searchProducts]);

  // --- ИСПРАВЛЕННЫЙ ОБРАБОТЧИК ---
  const handleViewAllClick = () => {
    const currentPath = `${pathname}?${searchParams.toString()}`;
    const params = searchQuery ? `?search=${searchQuery}` : '';
    const newPath = `/products${params}`;
    push(newPath);
  };

  const renderProductsSection = () => {
    if (isLoadingProducts) return <Spinner />;
    if (error) return <ErrorMessage message={error} />;
    if (products.length === 0 && searchQuery) {
       return (
         <div className="text-center p-8 text-gray-500">
            <p className="text-lg font-semibold">Ничего не найдено</p>
            <p className="text-sm">Попробуйте другой поисковый запрос.</p>
         </div>
       );
    }
    return (
      <div className="space-y-6">
        <ProductList products={products} />
        {products.length > 0 && (
          <Button onClick={handleViewAllClick} variant="secondary">
            Просмотреть все
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <header className="pt-4">
        <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </header>
      
      <main className="space-y-6">
        <CategoryCarousel categories={categories} isLoading={isLoadingCategories} />
        
        <div className="px-4">
        <h2 className="text-xl font-bold mb-4 text-main-text">
          {searchQuery ? 'Результаты поиска' : 'Популярные товары'}
        </h2>
          {renderProductsSection()}
        </div>
      </main>
    </div>
  );
}