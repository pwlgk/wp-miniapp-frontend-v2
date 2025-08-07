// types/index.ts
export type Category = {
  id: number;
  name: string;
  slug: string;
  parent?: number;
  count?: number;
  // --- ОБНОВЛЕНО ---
  // Поле image теперь может быть либо объектом с деталями, либо null
  image: {
    id: number;
    src: string;
    name: string;
    alt: string;
  } | null;
};

// Обновляем тип Product для соответствия новому API
export type Product = {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  price_html?: string; // Знак '?' делает поле необязательным
  sku: string;

  images: {
    id: number;
    src: string;
    name: string;
    alt: string;
  }[];
  // Добавляем поле categories, которое есть в ответе
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  // Эти поля тоже есть, добавим их
  description: string;
  short_description: string;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
};

export type Tag = {
  id: number;
  name: string;
  slug: string;
  count: number;
};


export interface CustomerUpdatePayload {
  first_name?: string;
  last_name?: string;
  billing?: {
    phone?: string;
    city?: string;
  };
}

// Полная информация о пользователе
export interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing: {
    phone: string;
    city: string;
  };
}
export interface LineItemCreate {
  product_id: number;
  quantity: number;
  variation_id?: number;
}

// Тип для адреса
export interface Address {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

// Определяем, как выглядит один элемент в списке товаров заказа
export interface CouponLine {
  id: number;
  code: string;
  discount: string;
}

export interface MetaDataItem {
  id: number;
  key: string;
  value: string;
}

export interface OrderLineItem {
  id: number;
  name: string;
  product_id: number;
  quantity: number;
  total: string;
  price: number;
  image?: {
    id: string; // id может быть строкой
    src: string;
  }
}

// Обновляем основной тип заказа
export interface OrderWooCommerce {
  id: number;
  status: string;
  currency: string;
  total: string;
  discount_total: string; // <- Сумма скидки
  date_created: string;
  billing: Address;
  shipping: Address;
  line_items: OrderLineItem[];
  coupon_lines: CouponLine[]; // <- Информация о купонах
  meta_data: MetaDataItem[];   // <- Метаданные
  customer_note: string;     // <- Примечание клиента
}


export interface OrderPayload {
  line_items: LineItemCreate[];
  customer_note?: string;
  coupon_code?: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    city?: string;
  };
}

// Тип для ответа при валидации купона
export interface CouponValidationResponse {
  valid: boolean;
  code: string;
  message?: string;
  discount_type?: string;
  amount?: string;
}