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
  services: {
    list: '/services',
    categories: '/services/categories',
    mine: '/services/mine',
    favourites: '/services/favourites/me',
    favourite: (serviceId: number) => `/services/${serviceId}/favourite`,
    areas: '/services/areas',
    myAreas: '/services/areas/mine',
  },
} as const;
