// app/catalog/page.tsx
"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { getCategories } from '@/services/api';
import { Category } from '@/types';
import { useNavigation } from '@/context/NavigationContext'; // Наша новая навигация

// Импорт компонентов
import CategoryListItem from '@/components/catalog/CategoryListItem';
import CategoryHeroCard from '@/components/catalog/CategoryHeroCard'; 
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';

function CatalogPageContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { push } = useNavigation();
  
  const selectedCategoryId = searchParams.get('categoryId');
  const categoryId = selectedCategoryId ? parseInt(selectedCategoryId, 10) : null;

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [displayCategories, setDisplayCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setupBackButton, hideMainButton } = useTelegramButtons();

  useEffect(() => {
    setupBackButton(true); // Показываем кнопку "Назад"
    hideMainButton();     // Скрываем главную кнопку
  }, [setupBackButton, hideMainButton]);
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setAllCategories(categoriesData);
      } catch (e: any) {
        setError("Не удалось загрузить структуру каталога");
      } finally {
        setIsGlobalLoading(false);
      }
    };
    fetchAllCategories();
  }, []);

  const loadPageData = useCallback(async () => {
    if (allCategories.length === 0) return;
    setIsPageLoading(true);
    setError(null);
    try {
      if (categoryId !== null) {
        const foundCategory = allCategories.find(c => c.id === categoryId);
        if (!foundCategory) {
          setError("Категория не найдена");
          setCurrentCategory(null);
          setDisplayCategories([]);
          return;
        }
        setCurrentCategory(foundCategory);
        // Загружаем ТОЛЬКО подкатегории
        const subCats = await getCategories({ parent: foundCategory.id });
        setDisplayCategories(subCats);
      } else {
        const rootCategories = allCategories.filter(c => c.parent === 0);
        setCurrentCategory(null);
        setDisplayCategories(rootCategories);
      }
    } catch (e: any) {
      setError(e.message || "Произошла ошибка при загрузке");
    } finally {
      setIsPageLoading(false);
    }
  }, [allCategories, categoryId]);

  useEffect(() => {
    if (!isGlobalLoading) {
      loadPageData();
    }
  }, [isGlobalLoading, loadPageData]);

  if (isGlobalLoading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error && !isPageLoading) return <ErrorMessage message={error} />;
  
  const isRootCatalog = categoryId === null;

  // --- НОВЫЙ ОБРАБОТЧИК ДЛЯ КНОПКИ "ВСЕ ТОВАРЫ" ---
  const handleViewAllProducts = () => {
    const currentPath = `${pathname}?${searchParams.toString()}`;
    const categoryName = currentCategory ? encodeURIComponent(currentCategory.name) : '';
    const newPath = `/products?category=${categoryId || ''}&categoryName=${categoryName}`;
    push(newPath);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-main-text">
        {currentCategory ? currentCategory.name : 'Каталог'}
      </h1>

      {isPageLoading ? (
        <div className="flex justify-center items-center h-48"><Spinner /></div>
      ) : (
        <div className="space-y-3">
          {displayCategories.length > 0 && displayCategories.map(cat => 
            isRootCatalog ? (
              <CategoryHeroCard key={cat.id} category={cat} />
            ) : (
              <CategoryListItem key={cat.id} category={cat} />
            )
          )}
          
          {/* --- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Link заменен на Button с onClick --- */}
          <Button onClick={handleViewAllProducts} variant="secondary">
              {currentCategory ? `Все товары в "${currentCategory.name}"` : 'Все товары'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spinner /></div>}>
      <CatalogPageContent />
    </Suspense>
  );
}