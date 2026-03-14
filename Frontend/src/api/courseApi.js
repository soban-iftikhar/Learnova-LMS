import axiosInstance from './axiosInstance';

export const courseApi = {
  getAllCourses: async (filters = {}) => {
    const response = await axiosInstance.get('/courses', {
      params: filters,
    });
    return response.data;
  },

  getCourseById: async (courseId) => {
    const response = await axiosInstance.get(`/courses/${courseId}`);
    return response.data;
  },

  getEnrolledCourses: async () => {
    const response = await axiosInstance.get('/courses/enrolled');
    return response.data;
  },

  enrollCourse: async (courseId) => {
    const response = await axiosInstance.post(`/courses/${courseId}/enroll`);
    return response.data;
  },

  getCourseProgress: async (courseId) => {
    const response = await axiosInstance.get(`/courses/${courseId}/progress`);
    return response.data;
  },

  getRecentCourses: async () => {
    const response = await axiosInstance.get('/courses/recent');
    return response.data;
  },
};
