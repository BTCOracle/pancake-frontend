import { NEXT_PUBLIC_GIFT_API } from '../constants'

interface ApiAdapterConfig {
  baseUrl?: string
  defaultHeaders?: Record<string, string>
  timeout?: number
}

interface RequestConfig {
  headers?: Record<string, string>
  timeout?: number
}

// Abstract base interface for query parameters
// Concrete implementations must define their own specific properties
export interface QueryParams {
  // This interface is intentionally abstract - implementations should define specific properties
}

/**
 * Parse query parameters into URL search string
 */
function parseQuery<T extends QueryParams>(params: T): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Handle response and parse JSON
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`)
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return response.text() as T
}

export class ApiAdapter {
  private baseUrl: string

  private defaultHeaders: Record<string, string>

  private timeout: number

  constructor(config: ApiAdapterConfig = {}) {
    this.baseUrl = config.baseUrl || ''
    this.defaultHeaders = config.defaultHeaders || {
      'Content-Type': 'application/json',
    }
    this.timeout = config.timeout || 10000
  }

  /**
   * Build full URL with base URL and query parameters
   */
  private buildUrl<T extends QueryParams>(endpoint: string, queryParams?: T): string {
    const url = this.baseUrl + endpoint
    const query = queryParams ? parseQuery(queryParams) : ''
    return url + query
  }

  /**
   * Create fetch request with timeout and headers
   */
  private async makeRequest(url: string, options: RequestInit & { timeout?: number } = {}): Promise<Response> {
    const { timeout = this.timeout, ...fetchOptions } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          ...this.defaultHeaders,
          ...fetchOptions.headers,
        },
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  /**
   * Perform GET request
   */
  async get<TResponse, TQuery extends QueryParams = QueryParams>(
    endpoint: string,
    queryParams?: TQuery,
    config?: RequestConfig,
  ): Promise<TResponse> {
    const url = this.buildUrl(endpoint, queryParams)

    const response = await this.makeRequest(url, {
      method: 'GET',
      headers: config?.headers,
      timeout: config?.timeout,
    })

    return handleResponse<TResponse>(response)
  }

  /**
   * Perform POST request
   */
  async post<TResponse, TQuery extends QueryParams = QueryParams>(
    endpoint: string,
    body?: any,
    queryParams?: TQuery,
    config?: RequestConfig,
  ): Promise<TResponse> {
    const url = this.buildUrl(endpoint, queryParams)

    const response = await this.makeRequest(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: config?.headers,
      timeout: config?.timeout,
    })

    return handleResponse<TResponse>(response)
  }

  /**
   * Update default headers
   */
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value
  }

  /**
   * Remove default header
   */
  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key]
  }

  /**
   * Get current default headers
   */
  getDefaultHeaders(): Record<string, string> {
    return { ...this.defaultHeaders }
  }
}

// Export a default instance for convenience
export const giftApiAdapter = new ApiAdapter({
  baseUrl: NEXT_PUBLIC_GIFT_API,
})
