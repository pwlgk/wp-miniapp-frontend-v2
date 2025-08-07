// components/ProductList.tsx
import ProductCard from './ProductCard';
import { Product } from '@/types';

type ProductListProps = {
  products: Product[];
};

export default function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Товары не найдены.</p>
        <p className="text-sm">Попробуйте изменить фильтры.</p>
      </div>
    );
  }

  return (
    // ИЗМЕНЕНИЕ: Используем `grid-rows-auto` для более предсказуемого поведения
    // `items-stretch` заставит все карточки в ряду иметь одинаковую высоту
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-stretch">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}