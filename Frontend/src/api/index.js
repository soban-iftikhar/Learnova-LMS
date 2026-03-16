import apiClient from './client'

// ─── Profile ──────────────────────────────────────────────────────────────────
export const profileApi = {
  get:    ()     => apiClient.get('/profile/me'),
  update: (data) => apiClient.put('/profile/me', data),
}

// ─── Enrollments ──────────────────────────────────────────────────────────────
export const enrollmentsApi = {
  enroll:       (courseId)     => apiClient.post('/enrollments', { course_id: courseId }),
  getMyCourses: (params = {})  => apiClient.get('/enrollments/my-courses', { params }),
  unenroll:     (enrollmentId) => apiClient.delete(`/enrollments/${enrollmentId}`),
  // Teacher only — students cannot call this
  markComplete: (enrollmentId) => apiClient.put(`/enrollments/${enrollmentId}/complete`),
}

// ─── Videos ───────────────────────────────────────────────────────────────────
export const videosApi = {
  getAll:  (courseId)                => apiClient.get(`/courses/${courseId}/videos`),
  create:  (courseId, data)          => apiClient.post(`/courses/${courseId}/videos`, data),
  update:  (courseId, videoId, data) => apiClient.put(`/courses/${courseId}/videos/${videoId}`, data),
  delete:  (courseId, videoId)       => apiClient.delete(`/courses/${courseId}/videos/${videoId}`),
}

// ─── Quizzes (student-facing, published only) ─────────────────────────────────
export const quizzesApi = {
  getAll:  (courseId)     => apiClient.get(`/courses/${courseId}/quizzes`),
  start:   (quizId)       => apiClient.post(`/quizzes/${quizId}/start`),
  submit:  (quizId, data) => apiClient.post(`/quizzes/${quizId}/submit`, data),
}

// ─── Quiz Management (teacher) ────────────────────────────────────────────────
export const quizManagementApi = {
  listForCourse:   (courseId)                   => apiClient.get(`/courses/${courseId}/quizzes/manage`),
  create:          (courseId, data)             => apiClient.post(`/courses/${courseId}/quizzes`, data),
  update:          (quizId, data)               => apiClient.put(`/quizzes/${quizId}`, data),
  delete:          (quizId)                     => apiClient.delete(`/quizzes/${quizId}`),
  togglePublish:   (quizId, published)          => apiClient.put(`/quizzes/${quizId}/publish`, { published }),
  getQuestions:    (quizId)                     => apiClient.get(`/quizzes/${quizId}/questions`),
  addQuestion:     (quizId, data)               => apiClient.post(`/quizzes/${quizId}/questions`, data),
  updateQuestion:  (quizId, questionId, data)   => apiClient.put(`/quizzes/${quizId}/questions/${questionId}`, data),
  deleteQuestion:  (quizId, questionId)         => apiClient.delete(`/quizzes/${quizId}/questions/${questionId}`),
}

// ─── Ratings ──────────────────────────────────────────────────────────────────
export const ratingsApi = {
  submit: (courseId, data) => apiClient.post(`/courses/${courseId}/rate`, data),
  get:    (courseId)       => apiClient.get(`/courses/${courseId}/rating`),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStudentDashboard:    () => apiClient.get('/dashboard/student'),
  getInstructorDashboard: () => apiClient.get('/dashboard/instructor'),
  getAdminDashboard:      () => apiClient.get('/dashboard/admin'),
}

// ─── Chat (channelId = courseId or courseId__studentId) ───────────────────────
export const chatApi = {
  getMessages: (channelId, since) =>
    apiClient.get(`/chat/${channelId}/messages`, { params: since ? { since } : {} }),
  send: (channelId, text) =>
    apiClient.post(`/chat/${channelId}/messages`, { text }),
}

// ─── Teacher-specific APIs ────────────────────────────────────────────────────
export const teacherApi = {
  getStudentProfile: (studentId) => apiClient.get(`/teacher/students/${studentId}`),
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll:  (params = {}) => apiClient.get('/categories', { params }),
  create:  (data)        => apiClient.post('/categories', data),
  update:  (id, data)    => apiClient.put(`/categories/${id}`, data),
  delete:  (id)          => apiClient.delete(`/categories/${id}`),
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getEngagement:      (params = {}) => apiClient.get('/analytics/engagement', { params }),
  getCourseAnalytics: (courseId, params = {}) =>
    apiClient.get(`/courses/${courseId}/analytics`, { params }),
}

// ─── Re-export courses ────────────────────────────────────────────────────────
export { coursesApi } from './courses'
