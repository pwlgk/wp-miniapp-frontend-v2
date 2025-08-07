// components/products/Pagination.tsx
"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null; // Не показываем пагинацию, если страница всего одна
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="p-2 rounded-md bg-white dark:bg-dark-secondary border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={20} />
      </button>

      <span className="font-semibold text-light-text dark:text-dark-text">
        Страница {currentPage} из {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md bg-white dark:bg-dark-secondary border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}