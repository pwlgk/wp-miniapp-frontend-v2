// services/api.ts
import { Category, Product, Tag, Customer, CustomerUpdatePayload, LineItemCreate, OrderWooCommerce, OrderPayload, CouponValidationResponse } from '@/types';

const BASE_URL = 'http://localhost:8000'; 

interface ApiProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}
export interface PaginatedProductsResponse {
  products: Product[];
  totalPages: number;
}

export const getTags = async (): Promise<Tag[]> => {
  const response = await fetch(`${BASE_URL}/api/v1/tags/`);
  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }
  return response.json();
};
// ОБНОВЛЕНО: getProducts теперь возвращает объект с товарами и totalPages
export const getProducts = async (params: { 
  page?: number;
  per_page?: number;
  orderby?: 'popularity' | 'date' | 'price' | 'title';
  order?: 'asc' | 'desc';
  category?: string;
  search?: string;
  on_sale?: boolean;
  featured?: boolean;
  tags?: string;
  include?: string; // <-- ДОБАВЛЯЕМ ЭТО ПОЛЕ

} = {}): Promise<PaginatedProductsResponse> => {
  // `per_page` теперь называется `page_size` в DRF, но ваш бэкенд может это переименовывать.
  // Оставим `per_page`, т.к. бэкенд-прослойка должна это обрабатывать.
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`${BASE_URL}/api/v1/products/?${query}`);

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  // Получаем весь JSON-ответ
  const data: ApiProductsResponse = await response.json();

  // Вычисляем общее количество страниц
  const itemsPerPage = params.per_page || 20; // Используем то же значение, что и в запросе
  const totalPages = Math.ceil(data.count / itemsPerPage);

  return { 
    products: data.results, 
    totalPages: totalPages > 0 ? totalPages : 1 // Убедимся, что возвращается хотя бы 1
  };
};

export const getProductById = async (id: number | string): Promise<Product> => {
  const apiClient = getApiClient();
  const response = await apiClient.get(`/api/v1/products/${id}`);
  if (!response.ok) throw new Error('Product not found');
  return response.json();
};

// ОБНОВЛЕНО: Добавляем возможность фильтрации по parent
export const getCategories = async (params: { parent?: number } = {}): Promise<Category[]> => {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`${BASE_URL}/api/v1/categories/?${query}`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};



/**
 * Проверяет, есть ли у категории дочерние категории.
 * @param parentId ID родительской категории
 * @returns true, если есть хотя бы одна дочерняя категория, иначе false.
 */
export const hasSubcategories = async (parentId: number): Promise<boolean> => {
  // Запрашиваем всего 1 дочернюю категорию.
  // Если массив придет непустой, значит, подкатегории есть.
  const query = new URLSearchParams({ parent: String(parentId), per_page: '1' }).toString();
  const response = await fetch(`${BASE_URL}/api/v1/categories/?${query}`);
  if (!response.ok) {
    // В случае ошибки считаем, что подкатегорий нет, чтобы не блокировать пользователя.
    console.error(`Failed to check subcategories for parent ${parentId}`);
    return false;
  }
  const data: Category[] = await response.json();
  return data.length > 0;
};


// Создадим единый клиент, чтобы не дублировать логику с initData
const getApiClient = () => {
  // Явное приведение типа для window
  const tgWindow = window as any;
  const initData = typeof window !== 'undefined' ? tgWindow.Telegram?.WebApp?.initData : undefined;
  
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  if (initData) {
    headers.append('X-Telegram-Init-Data', initData);
  }

  return {
    get: (endpoint: string) => fetch(`${BASE_URL}${endpoint}`, { method: 'GET', headers }),
    post: (endpoint: string, body: any) => fetch(`${BASE_URL}${endpoint}`, { method: 'POST', headers, body: JSON.stringify(body) }),
    put: (endpoint: string, body: any) => fetch(`${BASE_URL}${endpoint}`, { method: 'PUT', headers, body: JSON.stringify(body) }),
  };
};

/**
 * Получить данные текущего пользователя
 */
export const getMyInfo = async (): Promise<Customer> => {
  const apiClient = getApiClient();
  const response = await apiClient.get('/api/v1/customers/me');
  if (!response.ok) throw new Error('Failed to fetch user info');
  return response.json();
};

/**
 * Обновить данные текущего пользователя
 */
export const updateMyInfo = async (data: CustomerUpdatePayload): Promise<Customer> => {
  const apiClient = getApiClient();
  const response = await apiClient.put('/api/v1/customers/me', data);
  if (!response.ok) throw new Error('Failed to update user info');
  return response.json();
};


export interface CartItem {
  product_id: number;
  quantity: number;
  variation_id?: number;
  name: string;
  price: string;
  image_url: string;
  stock_quantity: number | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';}
export interface ServerCartResponse {
  items: CartItem[];
  messages: string[];
}

/**
 * Получить и синхронизировать корзину пользователя
 */
export const getMyCart = async (): Promise<ServerCartResponse> => {
  const apiClient = getApiClient();
  const response = await apiClient.get('/api/v1/cart/');
  if (!response.ok) return { items: [], messages: ['Не удалось загрузить корзину'] };
  return response.json();
};

/**
 * Сохранить/обновить корзину пользователя
 */
export const updateMyCart = async (items: LineItemCreate[]): Promise<any> => {
  const apiClient = getApiClient();
  // Для POST/PUT запросов getApiClient должен быть немного умнее
  const response = await apiClient.post('/api/v1/cart/', items);
  if (!response.ok) throw new Error('Failed to update cart');
  return response.json();
};

export const getMyOrders = async (): Promise<OrderWooCommerce[]> => {
  const apiClient = getApiClient();
  const response = await apiClient.get('/api/v1/orders/my');
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}


export const validateCoupon = async (code: string): Promise<CouponValidationResponse> => {
  const apiClient = getApiClient();
  const response = await apiClient.post('/api/v1/coupons/validate', { code });
  // Валидация купона может вернуть и 404, и 400, обработаем это как невалидный купон
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      valid: false,
      code,
      message: errorData.detail || "Промокод не найден или недействителен."
    }
  }
  return response.json();
};

/**
 * Создать новый заказ
 */
export const createOrder = async (payload: OrderPayload): Promise<OrderWooCommerce> => {
  const apiClient = getApiClient();
  const response = await apiClient.post('/api/v1/orders/', payload);
  if (response.status !== 201) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Не удалось создать заказ');
  }
  return response.json();
};
export const getMyOrderById = async (orderId: number | string): Promise<OrderWooCommerce> => {
  const apiClient = getApiClient();
  // --- ИЗМЕНЕНИЕ: Используем новый эндпоинт ---
  const response = await apiClient.get(`/api/v1/orders/${orderId}`);
  if (!response.ok) {
    throw new Error('Заказ не найден или у вас нет прав на его просмотр.');
  }
  return response.json();
};