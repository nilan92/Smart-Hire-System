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
  bookings: {
    create: '/bookings',
    customer: '/bookings/customer',
    provider: '/bookings/provider',
    byId: (bookingId: number) => `/bookings/${bookingId}`,
    accept: (bookingId: number) => `/bookings/${bookingId}/accept`,
    reject: (bookingId: number) => `/bookings/${bookingId}/reject`,
    cancel: (bookingId: number) => `/bookings/${bookingId}/cancel`,
    complete: (bookingId: number) => `/bookings/${bookingId}/complete`,
  },
  notifications: {
    list: '/notifications',
    markRead: (notificationId: number) => `/notifications/${notificationId}/read`,
  },
  availability: {
    add: '/providers/availability',
    mine: '/providers/availability/me',
    byProvider: (providerId: number) => `/providers/availability/provider/${providerId}`,
    remove: (slotId: number) => `/providers/availability/${slotId}`,
  },
} as const;
