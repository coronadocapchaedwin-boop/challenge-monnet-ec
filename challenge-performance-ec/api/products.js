import { post } from './client.js';
import { endpoints } from '../config/endpoints.js';

export function createProduct(payload, token) {
  return post(endpoints.products.create, payload, token);
}
