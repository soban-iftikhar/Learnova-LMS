import axiosInstance from './axiosInstance';

export const dashboardApi = {
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/dashboard/stats');
    return response.data;
  },

  getUpcomingTasks: async () => {
    const response = await axiosInstance.get('/dashboard/tasks');
    return response.data;
  },

  getCourseProgress: async () => {
    const response = await axiosInstance.get('/dashboard/progress');
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await axiosInstance.get('/dashboard/activity');
    return response.data;
  },
};
