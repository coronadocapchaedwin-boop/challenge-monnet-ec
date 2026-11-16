import { post, responseBody } from './client.js';
import { environment } from '../config/environment.js';
import { endpoints } from '../config/endpoints.js';

export function getJwt() {
  const response = post(endpoints.auth.login, {
    username: environment.username,
    password: environment.password,
  });

  const body = responseBody(response);

  if (response.status !== 200 || !body?.accessToken) {
    throw new Error(`Authentication failed: HTTP ${response.status}`);
  }

  return body.accessToken;
}
