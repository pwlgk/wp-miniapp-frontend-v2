// components/ProductCard.tsx
"use client"; // Добавляем 'use client', так как теперь здесь есть обработчики событий

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext'; // Импортируем хуки здесь
import { useNotifier } from '@/hooks/useNotifier';
import { ShoppingCart } from 'lucide-react';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]?.src || '/placeholder.png';
  const category = product.categories?.[0]?.name;

  // --- Логика добавления в корзину перенесена сюда ---
  const { dispatch } = useCart();
  const { notify } = useNotifier();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Предотвращаем переход по ссылке, которая оборачивает карточку
    e.preventDefault();
    e.stopPropagation();

    if (product.stock_status !== 'instock') {
      notify("Товара нет в наличии", 'error');
      return;
    }
    
    dispatch({
      type: "ADD_ITEM",
      payload: {
        product_id: product.id,
        quantity: 1,
        name: product.name,
        price: product.price,
        image_url: product.images?.[0]?.src || '',
        stock_quantity: product.stock_quantity,
        stock_status: product.stock_status,
      }
    });

    notify(`"${product.name}" добавлен в корзину!`, 'success');
  };

  return (
    // Весь контейнер все еще ссылка, но мы перехватим клик по кнопке
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col h-full bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-lg"
    >
      {/* Блок с картинкой */}
      <div className="relative w-full aspect-square overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {product.on_sale && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">SALE</div>
        )}
      </div>
      
      {/* Контентная часть */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Категория и Название */}
        <div className="flex-grow">
          {category && <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{category}</p>}
          <h3 className="text-sm font-bold text-light-text dark:text-dark-text h-10 line-clamp-2" title={product.name}>
            {product.name}
          </h3>
        </div>
        
        {/* Цена и кнопка (прижаты к низу) */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div 
            className="text-lg font-extrabold ttext-light-text dark:text-dark-text"
            dangerouslySetInnerHTML={{ __html: product.price_html || `${product.price} ₽` }} 
          />
          {/* Кнопка теперь является частью этой карточки */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock_status !== 'instock'}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-dark-accent text-light-text dark:text-dark-text shadow-md hover:scale-110 active:scale-100 transition-transform duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label="Добавить в корзину"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </Link>
  );
}