import apiClient from './client'

export const authApi = {
  register: (data) =>
    apiClient.post('/auth/register', {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role || 'STUDENT',
    }),

  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  logout: () =>
    apiClient.post('/auth/logout'),

  getMe: () =>
    apiClient.get('/auth/me'),

  refresh: (refreshToken) =>
    apiClient.post('/auth/refresh', null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }),
}
