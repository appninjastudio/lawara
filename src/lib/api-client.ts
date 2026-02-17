// Optimized API Client with retry, timeout, and error handling
import { config } from './config';

interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  success: boolean;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, timeout = 30000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
    this.defaultRetries = 3;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    const { timeout = this.defaultTimeout, retries = this.defaultRetries, retryDelay = 1000 } = config;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, options, timeout);
        
        if (!response.ok) {
          const errorText = await response.text();
          return {
            data: null,
            error: errorText || `HTTP ${response.status}`,
            status: response.status,
            success: false,
          };
        }

        const data = await response.json();
        return {
          data,
          error: null,
          status: response.status,
          success: true,
        };
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    return {
      data: null,
      error: lastError?.message || 'Request failed',
      status: 0,
      success: false,
    };
  }

  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.fetchWithRetry<T>(url, {
      method: 'GET',
      headers: { ...this.defaultHeaders, ...config.headers },
    }, config);
  }

  async post<T>(endpoint: string, body: unknown, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.fetchWithRetry<T>(url, {
      method: 'POST',
      headers: { ...this.defaultHeaders, ...config.headers },
      body: JSON.stringify(body),
    }, config);
  }

  async put<T>(endpoint: string, body: unknown, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.fetchWithRetry<T>(url, {
      method: 'PUT',
      headers: { ...this.defaultHeaders, ...config.headers },
      body: JSON.stringify(body),
    }, config);
  }

  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.fetchWithRetry<T>(url, {
      method: 'DELETE',
      headers: { ...this.defaultHeaders, ...config.headers },
    }, config);
  }
}

// Pre-configured API clients
export const apiClient = new ApiClient(config.api.baseUrl);
export const uyapClient = new ApiClient(config.api.uyap.baseUrl, config.api.uyap.timeout);
export const buyaparClient = new ApiClient(config.api.buyapar.baseUrl, config.api.buyapar.timeout);

export type { ApiResponse, RequestConfig };
