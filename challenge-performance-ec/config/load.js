const tps = Number(__ENV.TPS);
const duration = '1m';

export const load = {
  tps,
  duration,
  expectedIterations: tps * 60,
};

export const options = {
  scenarios: {
    products: {
      executor: 'constant-arrival-rate',
      rate: tps,
      timeUnit: '1s',
      duration,
      preAllocatedVUs: tps,
      gracefulStop: '15s',
    },
  },
  thresholds: {
    successful_requests: ['rate==1'],
    http_429: ['count==0'],
    unexpected_status: ['count==0'],
    operation_requests: [`count>=${load.expectedIterations}`],
    dropped_iterations: ['count==0'],
  },
  summaryTrendStats: ['avg', 'p(95)', 'p(99)', 'max'],
};
