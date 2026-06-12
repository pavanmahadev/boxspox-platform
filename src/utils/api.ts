import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

/**
 * Pandaschool API Utility
 * - Centralized configuration
 * - Request/Response interceptors
 * - Error handling & retries
 * - Timeout management
 */

class ApiClient {
  private instance: AxiosInstance;
  private maxRetries: number = 2;

  constructor() {
    this.instance = axios.create({
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    // Request Interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add auth token if available on client side
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("sb-access-token");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as any;

        // Implement simple retry for network errors or 503
        if (config && config.retryCount < this.maxRetries && (error.code === 'ECONNABORTED' || error.response?.status === 503)) {
          config.retryCount = (config.retryCount || 0) + 1;
          console.log(`Retrying request... (${config.retryCount})`);
          return this.instance(config);
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: AxiosError) {
    if (error.response) {
      // Server responded with non-2xx code
      return {
        message: (error.response.data as any)?.message || "An unexpected server error occurred",
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // No response received
      return {
        message: "No response from server. Please check your internet connection.",
        status: 0,
      };
    }
    return {
      message: error.message || "An unknown error occurred",
      status: -1,
    };
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.get(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(url, config);
    return response.data;
  }
}

export const api = new ApiClient();
