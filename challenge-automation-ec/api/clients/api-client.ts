import { performance } from 'node:perf_hooks';
import type { APIRequestContext } from '@playwright/test';

export interface ApiResult<T> {
  status: number;
  body: T;
  responseTimeMs: number;
}

export abstract class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
  ) {
    // Las rutas relativas deben conservar prefijos base como /api/v2/.
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  protected async send<T>(
    method: 'GET' | 'POST',
    path: string,
    data?: unknown,
  ): Promise<ApiResult<T>> {
    const url = new URL(path, this.baseUrl).href;
    const startedAt = performance.now();
    const response = await this.request.fetch(url, { method, data, failOnStatusCode: false });
    const responseTimeMs = performance.now() - startedAt;

    try {
      return {
        status: response.status(),
        body: (await response.json()) as T,
        responseTimeMs,
      };
    } catch {
      throw new Error(`Invalid JSON response from ${path} (HTTP ${response.status()}).`);
    }
  }
}
