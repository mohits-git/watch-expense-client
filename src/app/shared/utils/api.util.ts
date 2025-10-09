import { BASE_URL } from '../constants';

export const getFullApiUrl = (endpoint: string) => {
  return `${BASE_URL.API}${endpoint}`;
};

export const buildAPIEndpoint = (
  endpoint: string,
  params?: Record<string, string | number | boolean>,
) => {
  if (!params) {
    return endpoint;
  }
  let builtEndpoint = endpoint;
  for (const [key, value] of Object.entries(params)) {
    builtEndpoint = builtEndpoint.replace(
      `:${key}`,
      encodeURIComponent(String(value)),
    );
  }
  return builtEndpoint;
};
