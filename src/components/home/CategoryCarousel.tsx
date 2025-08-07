// components/home/CategoryCarousel.tsx
"use client";

import { Category } from '@/types';
import Spinner from '@/components/ui/Spinner';
import CategoryCard from './CategoryCard'; // Импортируем новую карточку

type CategoryCarouselProps = {
  categories: Category[];
  isLoading: boolean;
};

export default function CategoryCarousel({ categories, isLoading }: CategoryCarouselProps) {
  if (isLoading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const rootCategories = categories.filter(cat => cat.parent === 0);

  return (
    <div className="pl-4 py-2">
      {/* Меняем scrollbar-hide на no-scrollbar */}
      <div className="flex space-x-4 overflow-x-auto no-scrollbar">
        {rootCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
        <div className="flex-shrink-0 w-1"></div>
      </div>
    </div>
  );
}