import apiClient from './client'

export const coursesApi = {
  getAll: (params = {}) =>
    apiClient.get('/courses', { params }),

  getById: (id) =>
    apiClient.get(`/courses/${id}`),

  getContent: (id) =>
    apiClient.get(`/courses/${id}/content`),

  create: (data) =>
    apiClient.post('/courses', data),

  update: (id, data) =>
    apiClient.put(`/courses/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/courses/${id}`),

  getAnalytics: (id, params = {}) =>
    apiClient.get(`/courses/${id}/analytics`, { params }),

  getQuizzes: (courseId) =>
    apiClient.get(`/courses/${courseId}/quizzes`),

  getEnrollments: (courseId, params = {}) =>
    apiClient.get(`/courses/${courseId}/enrollments`, { params }),

  // Teacher: get all quiz results across a course (from DB)
  getQuizResults: (courseId) =>
    apiClient.get(`/courses/${courseId}/quiz-results`),
}
