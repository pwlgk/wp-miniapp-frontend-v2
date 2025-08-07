// components/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import QuickAddToCartButton from '../products/QuickAddToCartButton'; // Импортируем нашу кнопку

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]?.src || '/placeholder.png';
  
  // Получаем первую категорию товара для отображения
  const category = product.categories?.[0]?.name;

  return (
    <div className="group flex flex-col bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {product.on_sale && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              SALE
            </div>
          )}
        </div>
      </Link>
      
      {/* Контентная часть карточки */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Категория товара */}
        {category && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{category}</p>
        )}
        
        {/* Название товара с ограничением длины */}
        <Link href={`/products/${product.id}`} className="block mb-2">
          <h3 
            className="text-sm font-bold text-light-text dark:text-dark-text h-10 overflow-hidden line-clamp-2"
            title={product.name} // Показываем полное имя при наведении
          >
            {product.name}
          </h3>
        </Link>
        
        {/* Цена и кнопка "В корзину" */}
        <div className="mt-auto flex items-center justify-between">
          <div 
            className="text-lg font-extrabold text-light-text dark:text-white"
            dangerouslySetInnerHTML={{ __html: product.price_html || `${product.price} ₽` }} 
          />
          <QuickAddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}