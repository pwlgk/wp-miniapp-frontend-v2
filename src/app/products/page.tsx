// app/products/page.tsx
"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { getProducts, getTags } from '@/services/api';
import { Product, Tag } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigation } from '@/context/NavigationContext';

// Импорт UI компонентов
import ProductList from '@/components/ProductList';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import ProductFilters, { TSortOption } from '@/components/products/ProductFilters';
import FilterPanel, { FilterValues } from '@/components/products/FilterPanel';
import Pagination from '@/components/products/Pagination';
import { SlidersHorizontal } from 'lucide-react';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';

function ProductsPageContent() {
  const { push } = useNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const categoryId = searchParams.get('category');
  const categoryNameParam = searchParams.get('categoryName');
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortOption, setSortOption] = useState<TSortOption>('popularity-desc');
  const [filters, setFilters] = useState<FilterValues>({
    search: searchParams.get('search') || '',
    onSale: false,
    featured: false,
    selectedTags: [],
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const debouncedSearch = useDebounce(filters.search, 500);
  
  const { setupBackButton, hideMainButton } = useTelegramButtons();

  // --- ИЗМЕНЕНИЕ 1: Добавляем состояние для готовности ---
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setupBackButton(true);
    hideMainButton();
  }, [setupBackButton, hideMainButton]);
  
  // Загружаем теги и устанавливаем флаг готовности
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const tagsData = await getTags();
        setAllTags(tagsData);
      } catch (e) {
        console.error("Failed to load tags:", e);
      } finally {
        // Устанавливаем флаг, что можно начинать загрузку товаров
        setIsReady(true); 
      }
    };
    fetchInitialData();
  }, []);
  
  // Основной useEffect для загрузки данных
  useEffect(() => {
    // --- ИЗМЕНЕНИЕ 2: Добавляем "защиту" ---
    // Не запускаем, пока не загружены начальные данные (теги)
    if (!isReady) return;

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [orderby, order] = sortOption.split('-') as [string, 'asc' | 'desc'];
        const params: any = { 
          page: currentPage, per_page: 20, orderby, order 
        };
        if (categoryId) params.category = categoryId;
        if (debouncedSearch) params.search = debouncedSearch;
        if (filters.onSale) params.on_sale = true;
        if (filters.featured) params.featured = true;
        if (filters.selectedTags.length > 0) params.tags = filters.selectedTags.join(',');
        
        const { products: productsData, totalPages: totalPagesData } = await getProducts(params);
        setProducts(productsData);
        setTotalPages(totalPagesData);
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить товары");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [isReady, categoryId, currentPage, sortOption, debouncedSearch, filters.onSale, filters.featured, filters.selectedTags]);

  // --- Обработчики действий пользователя (переписаны для большей надежности) ---
  const createNavAction = (newParams: Record<string, string | number | null>) => {
    const currentPath = `${pathname}?${searchParams.toString()}`;
    const newSearchParams = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, String(value));
      } else {
        newSearchParams.delete(key);
      }
    });
    const newPath = `${pathname}?${newSearchParams.toString()}`;
    push(newPath);
  };
  
  const handlePageChange = (newPage: number) => {
    createNavAction({ page: newPage });
    window.scrollTo(0, 0);
  };
  
  const applyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    createNavAction({ page: 1, search: newFilters.search });
    setIsFilterPanelOpen(false);
  }
  
  const handleSortChange = (newSort: TSortOption) => {
    setSortOption(newSort);
    if (currentPage !== 1) {
      createNavAction({ page: 1 });
    }
  }

  const getPageTitle = () => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) return `Поиск: "${searchQuery}"`;
    if (categoryNameParam) return decodeURIComponent(categoryNameParam);
    return 'Все товары';
  }
  
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
          className="flex-shrink-0 h-full p-3 bg-white rounded-lg shadow-sm border border-gray-200"
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
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64"><Spinner /></div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
          {products.length > 0 ? (
            <>
              <ProductList products={products} />
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
             <div className="text-center p-8 text-gray-500">
                <p className="text-lg font-semibold">Товары не найдены</p>
                <p className="text-sm">Попробуйте изменить фильтры или поисковый запрос.</p>
             </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spinner /></div>}>
      <ProductsPageContent />
    </Suspense>
  );
}