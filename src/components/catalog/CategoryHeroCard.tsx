// components/catalog/CategoryHeroCard.tsx
"use client";

import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation'; // Импортируем хуки
import { Category } from '@/types';
import { hasSubcategories } from '@/services/api';
import Image from 'next/image';
import { Layers3, Loader2 } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';

interface CategoryHeroCardProps {
  category: Category;
}

export default function CategoryHeroCard({ category }: CategoryHeroCardProps) {
  const { push } = useNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isChecking, setIsChecking] = useState(false);
  const imageUrl = category.image?.src;

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
      className="group relative w-full h-32 rounded-2xl shadow-lg overflow-hidden focus:outline-none focus:ring-4 focus:ring-accent focus:ring-opacity-70 disabled:opacity-80 disabled:cursor-wait"
    >
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt={category.name}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
        </>
      ) : (
        <div className="absolute inset-0 bg-secondary"></div>
      )}
      
      <div className="relative z-10 flex items-center justify-center w-full h-full p-4 text-center">
        {isChecking ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : (
          <div className="flex items-center gap-3">
            {!imageUrl && <Layers3 className="w-8 h-8 text-main-text" />}
            <span className={`font-bold text-2xl drop-shadow-md ${imageUrl ? 'text-white' : 'text-main-text'}`}>
              {category.name}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}