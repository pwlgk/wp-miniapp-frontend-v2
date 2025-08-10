// app/products/page.tsx
"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, getTags } from '@/services/api';
import { Product, Tag } from '@/types';
import { useNavigation } from '@/context/NavigationContext';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

// Импорт UI компонентов
import ProductList from '@/components/ProductList';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import ProductFilters, { TSortOption } from '@/components/products/ProductFilters';
import FilterPanel, { FilterValues } from '@/components/products/FilterPanel';
import { SlidersHorizontal } from 'lucide-react';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';

function ProductsPageContent() {
  const { push } = useNavigation(); // Предполагается, что у вас есть этот хук
  const searchParams = useSearchParams();
  
  // Параметры из URL для ключа запроса
  const categoryId = searchParams.get('category');
  const categoryNameParam = searchParams.get('categoryName');
  
  // Состояния для фильтров и UI
  const [sortOption, setSortOption] = useState<TSortOption>('popularity-desc');
  const [filters, setFilters] = useState<FilterValues>({
    search: searchParams.get('search') || '',
    onSale: false,
    featured: false,
    selectedTags: [],
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // --- Загрузка тегов с помощью useQuery ---
  // Данные будут закэшированы и не будут перезапрашиваться при каждом рендере
  const { data: allTags = [] } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: getTags,
  });
  
  // --- ОСНОВНОЙ ЗАПРОС С useInfiniteQuery ---
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    // Ключ запроса. При его изменении React Query делает новый, чистый запрос.
    queryKey: ['products', categoryId, sortOption, filters],
    // Функция, которая делает запрос. Она получает pageParam.
    queryFn: ({ pageParam = 1 }) => {
      const [orderby, order] = sortOption.split('-') as [string, 'asc' | 'desc'];
      const params: any = { 
        page: pageParam, 
        per_page: 20, 
        orderby, 
        order 
      };
      if (categoryId) params.category = categoryId;
      if (filters.search) params.search = filters.search;
      if (filters.onSale) params.on_sale = true;
      if (filters.featured) params.featured = true;
      if (filters.selectedTags.length > 0) params.tags = filters.selectedTags.join(',');
      
      return getProducts(params);
    },
    // Функция, определяющая, какой номер у следующей страницы
    getNextPageParam: (lastPage) => lastPage.nextPage, // Используем nextPage из нашего API
    initialPageParam: 1, // Начинаем с первой страницы
  });

  // Отслеживание элемента для догрузки
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.5 });

  // Эффект для догрузки
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // --- Обработчики ---
  const applyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setIsFilterPanelOpen(false);
  };
  
  const handleSortChange = (newSort: TSortOption) => {
    setSortOption(newSort);
  };
  
  const getPageTitle = () => {
    if (filters.search) return `Поиск: "${filters.search}"`;
    if (categoryNameParam) return decodeURIComponent(categoryNameParam);
    return 'Все товары';
  };
  
  // Объединяем все загруженные страницы в один массив для рендера
  const products = useMemo(() => data?.pages.flatMap(page => page.products) ?? [], [data]);
  
  const { setupBackButton, hideMainButton } = useTelegramButtons();

  useEffect(() => {
    setupBackButton(true);
    hideMainButton();
  }, [setupBackButton, hideMainButton]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-main-text">{getPageTitle()}</h1>
      
      <div className="flex gap-4 items-center">
        <div className="flex-grow">
          <ProductFilters 
            currentSort={sortOption} 
            onSortChange={handleSortChange} 
          />
        </div>
        <button 
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          className="flex-shrink-0 h-full p-3 bg-white dark:bg-dark-secondary rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
        >
          <SlidersHorizontal />
        </button>
      </div>

      <FilterPanel 
        isOpen={isFilterPanelOpen}
        allTags={allTags}
        initialFilters={filters}
        onApply={applyFilters}
      />
      
      {/* --- Логика рендеринга на основе статуса из React Query --- */}
      {status === 'pending' ? (
        <div className="flex justify-center items-center h-64"><Spinner /></div>
      ) : status === 'error' ? (
        <ErrorMessage message={error.message} />
      ) : (
        <>
          {products.length > 0 ? (
            <ProductList products={products} />
          ) : (
             <div className="text-center p-8 text-gray-500">
                <p className="text-lg font-semibold">Товары не найдены</p>
                <p className="text-sm">Попробуйте изменить фильтры или поисковый запрос.</p>
             </div>
          )}
          
          {/* Элемент-триггер для догрузки и спиннер догрузки */}
          <div ref={loadMoreRef} className="h-10 w-full">
            {isFetchingNextPage && <Spinner />}
          </div>
        </>
      )}
    </div>
  );
}

// Обертка Suspense для использования useSearchParams
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spinner /></div>}>
      <ProductsPageContent />
    </Suspense>
  );
}