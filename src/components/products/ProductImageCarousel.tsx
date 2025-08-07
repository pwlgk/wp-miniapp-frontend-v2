// components/products/ProductImageCarousel.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { Product } from '@/types';

interface PropType {
  images: Product['images'];
  productName: string;
}

export default function ProductImageCarousel({ images, productName }: PropType) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    // Очистка при размонтировании
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  if (!images || images.length === 0) {
    // Показываем заглушку, если нет изображений
    return (
      <div className="relative w-full aspect-square bg-gray-100 dark:bg-neutral-800">
        <Image src="/placeholder.png" alt="No image available" fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-b-2xl" ref={emblaRef}>
        <div className="flex">
          {images.map((img) => (
            <div className="relative flex-grow-0 flex-shrink-0 w-full aspect-square" key={img.id}>
              <Image
                src={img.src}
                alt={img.alt || productName}
                fill
                priority={images.indexOf(img) === 0} // Загружаем первое изображение в приоритете
                className="object-cover"
                sizes="100vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Точки для навигации */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}