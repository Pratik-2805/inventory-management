const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const headers = new Headers(options?.headers);
    if (!(options?.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { success: response.ok };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || `HTTP error! status: ${response.status}`,
      };
    }

    return data as ApiResponse<T>;
  } catch (error: any) {
    console.error('API Client Error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | undefined>) => {
    let query = '';
    if (params) {
      const filteredParams = Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
      if (filteredParams.length > 0) {
        query = `?${filteredParams.join('&')}`;
      }
    }
    return request<T>(`${path}${query}`, { method: 'GET' });
  },

  post: <T>(path: string, body: any) => {
    return request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put: <T>(path: string, body: any) => {
    return request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete: <T>(path: string) => {
    return request<T>(path, { method: 'DELETE' });
  },
};
