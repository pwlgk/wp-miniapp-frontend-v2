"use client";

import { ListFilter } from 'lucide-react';

// Определяем возможные значения для нашего единого фильтра
export type TSortOption = 
  | 'popularity-desc'
  | 'date-desc'
  | 'price-asc'
  | 'price-desc'
  | 'title-asc';

// Определяем, что наш компонент принимает и возвращает это значение
interface ProductFiltersProps {
  currentSort: TSortOption;
  onSortChange: (value: TSortOption) => void;
}

export default function ProductFilters({
  currentSort,
  onSortChange
}: ProductFiltersProps) {
  
  return (
    <div className="p-4 bg-gray-100 rounded-xl flex items-center gap-4">
      <div className="flex-shrink-0 flex items-center gap-2">
        <ListFilter size={18} />
      </div>
      
      <select 
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value as TSortOption)}
        className="w-full bg-white text-main-text p-2 rounded-md border border-gray-300 focus:ring-0 focus:border-accent"
      >
        <option value="popularity-desc">По популярности</option>
        <option value="date-desc">По новизне</option>
        <option value="price-asc">Цена: по возрастанию</option>
        <option value="price-desc">Цена: по убыванию</option>
        <option value="title-asc">По названию (А-Я)</option>
      </select>
    </div>
  )
}
