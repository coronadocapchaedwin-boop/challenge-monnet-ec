const baseUrl = __ENV.BASE_URL?.trim();

if (!baseUrl) {
  throw new Error('BASE_URL is required');
}

export const environment = {
  name: __ENV.ENV || 'qa',
  baseUrl: baseUrl.replace(/\/$/, ''),
  username: __ENV.DUMMYJSON_USERNAME,
  password: __ENV.DUMMYJSON_PASSWORD,
};
