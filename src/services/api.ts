// services/api.ts
import { Category, Product, Tag, Customer, CustomerUpdatePayload, LineItemCreate, OrderWooCommerce, OrderPayload, CouponValidationResponse } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; 

interface ApiProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface InfiniteProductsResponse {
  products: Product[];
  nextPage: number | undefined; // Номер следующей страницы или undefined, если ее нет
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
  include?: string;
} = {}): Promise<InfiniteProductsResponse> => {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`${BASE_URL}/api/v1/products/?${query}`);

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  // Получаем весь JSON-ответ
  const data: ApiProductsResponse = await response.json();

  // Вычисляем номер следующей страницы из поля `next`
  let nextPage: number | undefined = undefined;
  if (data.next) {
    try {
      const nextUrl = new URL(data.next);
      const nextPageParam = nextUrl.searchParams.get('page');
      if (nextPageParam) {
        nextPage = parseInt(nextPageParam, 10);
      }
    } catch (e) {
      console.error("Could not parse next page URL:", data.next, e);
      // Если URL некорректный, считаем, что следующей страницы нет
      nextPage = undefined;
    }
  }

  return { 
    products: data.results, 
    nextPage: nextPage 
  };
};


// --- НОВАЯ ФУНКЦИЯ ---
/**
 * Регистрирует пользователя на бэкенде после получения
 * разрешения на отправку сообщений.
 * @param initData Актуальная строка initData
 * @returns {Promise<any>} Ответ от сервера (например, { status: "ok" })
 */
export const registerUser = async (initData: string | null): Promise<any> => {
  if (!initData) {
    throw new Error("Cannot register user without InitData.");
  }
  const apiClient = getApiClient(initData);
  // Убедитесь, что эндпоинт на бэкенде `/api/v1/users/register`
  const response = await apiClient.post('/api/v1/users/register', {}); // Тело может быть пустым
  if (!response.ok) {
    throw new Error('Failed to register user on the backend.');
  }
  return response.json();
};

export const getProductById = async (id: number | string): Promise<Product> => {
  // Убираем getApiClient и initData. Используем обычный fetch.
  const response = await fetch(`${BASE_URL}/api/v1/products/${id}`);
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
const getApiClient = (initData: string | null) => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  if (initData) {
    headers.append('X-Telegram-Init-Data', initData);
  } else {
    // Можно добавить лог, чтобы отследить, если initData не передается
    console.warn("API call is being made without Telegram InitData.");
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
export const getMyInfo = async (initData: string | null): Promise<Customer> => {
  const apiClient = getApiClient(initData);
  const response = await apiClient.get('/api/v1/customers/me');
  if (!response.ok) throw new Error('Failed to fetch user info');
  return response.json();
};

export const updateMyInfo = async (data: CustomerUpdatePayload, initData: string | null): Promise<Customer> => {
  const apiClient = getApiClient(initData);
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
export interface ServerCartResponse {
  items: CartItem[];
  messages: string[];
}

export const getMyCart = async (initData: string | null): Promise<ServerCartResponse> => {
  const apiClient = getApiClient(initData);
  const response = await apiClient.get('/api/v1/cart/');
  if (!response.ok) return { items: [], messages: ['Не удалось загрузить корзину'] };
  return response.json();
};

export const updateMyCart = async (items: LineItemCreate[], initData: string | null): Promise<any> => {
  const apiClient = getApiClient(initData);
  const response = await apiClient.post('/api/v1/cart/', items);
  if (!response.ok) throw new Error('Failed to update cart');
  return response.json();
};

export const getMyOrders = async (initData: string | null): Promise<OrderWooCommerce[]> => {
  const apiClient = getApiClient(initData);
  const response = await apiClient.get('/api/v1/orders/my');
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
};

export const getMyOrderById = async (orderId: number | string, initData: string | null): Promise<OrderWooCommerce> => {
  const apiClient = getApiClient(initData);
  const response = await apiClient.get(`/api/v1/orders/${orderId}`);
  if (!response.ok) {
    throw new Error('Заказ не найден или у вас нет прав на его просмотр.');
  }
  return response.json();
};

export const createOrder = async (payload: OrderPayload, initData: string | null): Promise<OrderWooCommerce> => {
  const apiClient = getApiClient(initData);
  const response = await apiClient.post('/api/v1/orders/', payload);
  if (response.status !== 201) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Не удалось создать заказ');
  }
  return response.json();
};

// --- Эндпоинты, которые могут быть и публичными, и приватными ---
// Валидация купона не требует данных пользователя, поэтому initData не нужен.
export const validateCoupon = async (code: string): Promise<CouponValidationResponse> => {
  // Используем обычный fetch, так как initData не требуется
  const response = await fetch(`${BASE_URL}/api/v1/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  
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