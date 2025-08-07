// components/home/CategoryCard.tsx
"use client";

import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation'; // Импортируем хуки
import { Category } from '@/types';
import { hasSubcategories } from '@/services/api';
import Image from 'next/image';
import { Layers3, Loader2 } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';

interface CategoryCardProps {
  category: Category;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  const { push } = useNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isChecking, setIsChecking] = useState(false);
  const imageUrl = category.image?.src;

  const handleClick = async () => {
    setIsChecking(true);
    
    // Получаем текущий путь (главную страницу)
    const currentPath = `${pathname}?${searchParams.toString()}`;
    
    const hasChildren = await hasSubcategories(category.id);
    const encodedName = encodeURIComponent(category.name);

    if (hasChildren) {
      push(`/catalog?categoryId=${category.id}`);
    } else {
      push(`/products?category=${category.id}&categoryName=${encodedName}`);
    }
  };

  if (imageUrl) {
    return (
      <button
        onClick={handleClick}
        disabled={isChecking}
        className="group relative flex-shrink-0 w-2/5 sm:w-1/3 md:w-1/4 h-36 rounded-2xl shadow-lg overflow-hidden focus:outline-none focus:ring-4 focus:ring-accent focus:ring-opacity-70 disabled:opacity-80 disabled:cursor-wait"
      >
        <Image
          src={imageUrl}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 40vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        <div className="relative z-10 flex items-end justify-center w-full h-full p-3 text-center">
          {isChecking ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <span className="font-bold text-lg text-white leading-tight drop-shadow-md">
              {category.name}
            </span>
          )}
        </div>
      </button>
    );
  } else {
    return (
      <button
        onClick={handleClick}
        disabled={isChecking}
        className="group flex-shrink-0 w-2/5 sm:w-1/3 md:w-1/4 focus:outline-none focus:ring-2 focus:ring-accent rounded-xl"
      >
        <div className="flex flex-col items-center justify-center text-center p-4 h-36 rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-80 disabled:cursor-wait">
          {isChecking ? (
            <Loader2 className="h-8 w-8 mb-2 text-accent animate-spin" />
          ) : (
            <Layers3 className="h-8 w-8 mb-2 text-accent" />
          )}
          <span className="font-bold text-md text-main-text leading-tight">
            {category.name}
          </span>
        </div>
      </button>
    );
  }
}