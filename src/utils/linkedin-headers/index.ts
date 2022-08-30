import type { AxiosRequestConfig } from 'axios';

export function linkedinHeaders(accessToken?: string): AxiosRequestConfig {
  return {
    headers: {
      ...(accessToken
        ? { authorization: `Bearer ${accessToken}` }
        : { 'Content-Type': 'application/x-www-form-urlencoded' }),
    },
  };
}
