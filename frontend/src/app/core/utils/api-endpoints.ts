export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
  },
  users: {
    me: '/users/me',
    providerProfile: '/users/provider-profile',
    publicProvider: (providerId: number) => `/users/providers/${providerId}`,
  },
} as const;
