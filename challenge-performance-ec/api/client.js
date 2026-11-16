import http from 'k6/http';
import { environment } from '../config/environment.js';

export function request(method, path, body, token) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return http.request(
    method,
    `${environment.baseUrl}${path}`,
    body === undefined ? null : JSON.stringify(body),
    { headers, timeout: '15s' }
  );
}

export function get(path, token) {
  return request('GET', path, undefined, token);
}

export function post(path, body, token) {
  return request('POST', path, body, token);
}

export function responseBody(response) {
  try {
    return response.json();
  } catch {
    return null;
  }
}
