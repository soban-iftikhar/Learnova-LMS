import axiosInstance from './axiosInstance';

export const authApi = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  signup: async (fullName, email, password) => {
    const response = await axiosInstance.post('/auth/signup', {
      fullName,
      email,
      password,
    });
    return response.data;
  },

  googleOAuth: async (token) => {
    const response = await axiosInstance.post('/auth/google', {
      token,
    });
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
};
