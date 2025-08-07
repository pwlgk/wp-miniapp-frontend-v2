// components/products/CategoryBadges.tsx
import { Product } from "@/types";
import Link from "next/link";

interface CategoryBadgesProps {
  categories: Product['categories'];
}

export default function CategoryBadges({ categories }: CategoryBadgesProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(category => (
        <Link 
          key={category.id} 
          href={`/products?category=${category.id}`}
          className="px-3 py-1 text-xs font-semibold bg-gray-100  text-main-text  rounded-full hover:bg-gray-200  transition-colors"
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}