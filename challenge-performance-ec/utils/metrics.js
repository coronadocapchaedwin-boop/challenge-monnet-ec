import { Counter, Rate, Trend } from 'k6/metrics';

export const operationRequests =
  new Counter('operation_requests');

export const operationDuration =
  new Trend('operation_duration', true);

export const successfulRequests = new Rate('successful_requests');
export const http429 = new Counter('http_429');
export const unexpectedStatus = new Counter('unexpected_status');

export function recordOperation(response, expectedStatus) {
  const status = response.status;
  operationRequests.add(1);
  operationDuration.add(response.timings.duration);
  successfulRequests.add(status === expectedStatus);
  http429.add(status === 429 ? 1 : 0);
  unexpectedStatus.add(
    status !== expectedStatus && status !== 429 ? 1 : 0
  );
}
