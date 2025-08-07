// components/catalog/CategoryListItem.tsx
"use client";

import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation'; // Импортируем хуки
import { Category } from '@/types';
import { hasSubcategories } from '@/services/api';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';

type CategoryListItemProps = {
  category: Category;
};

export default function CategoryListItem({ category }: CategoryListItemProps) {
  const { push } = useNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isChecking, setIsChecking] = useState(false);

  const handleClick = async () => {
    setIsChecking(true);
    
    // Получаем текущий путь ПЕРЕД навигацией
    const currentPath = `${pathname}?${searchParams.toString()}`;
    
    const hasChildren = await hasSubcategories(category.id);
    const encodedName = encodeURIComponent(category.name);

    if (hasChildren) {
      push(`/catalog?categoryId=${category.id}`);
    } else {
      push(`/products?category=${category.id}&categoryName=${encodedName}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isChecking}
      // Убираем dark: классы для соответствия стратегии "только светлая тема"
      className="flex items-center justify-between w-full p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-wait"
    >
      <div className="flex flex-col text-left">
        {/* Убираем dark: классы */}
        <span className="font-bold text-md text-main-text">
          {category.name}
        </span>
        <span className="text-sm text-gray-500">
          Товаров: {category.count}
        </span>
      </div>
      
      {isChecking ? (
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      ) : (
        <ChevronRight className="w-6 h-6 text-gray-400" />
      )}
    </button>
  );
}