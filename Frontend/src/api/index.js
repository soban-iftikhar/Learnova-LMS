import apiClient from './client'

export const profileApi = {
  get:    ()     => apiClient.get('/profile/me'),
  update: (data) => apiClient.put('/profile/me', data),
}

export const enrollmentsApi = {
  enroll:       (courseId)     => apiClient.post('/enrollments', { course_id: courseId }),
  getMyCourses: (params = {})  => apiClient.get('/enrollments/my-courses', { params }),
  unenroll:     (enrollmentId) => apiClient.delete(`/enrollments/${enrollmentId}`),
  markComplete: (enrollmentId) => apiClient.put(`/enrollments/${enrollmentId}/complete`),
}

export const videosApi = {
  getAll:  (courseId)                => apiClient.get(`/courses/${courseId}/videos`),
  create:  (courseId, data)          => apiClient.post(`/courses/${courseId}/videos`, data),
  update:  (courseId, videoId, data) => apiClient.put(`/courses/${courseId}/videos/${videoId}`, data),
  delete:  (courseId, videoId)       => apiClient.delete(`/courses/${courseId}/videos/${videoId}`),
}

export const assignmentsApi = {
  getAll:               (courseId)       => apiClient.get(`/courses/${courseId}/assignments`),
  create:               (courseId, data) => apiClient.post(`/courses/${courseId}/assignments`, data),
  submit: (assignmentId, formData) => apiClient.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getSubmissions:       (assignmentId)     => apiClient.get(`/assignments/${assignmentId}/submissions`),
  getCourseSubmissions: (courseId)         => apiClient.get(`/courses/${courseId}/submissions`),
  mySubmissions:        ()                 => apiClient.get('/submissions/my'),
  grade: (assignmentId, submissionId, data) =>
    apiClient.put(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
}

export const quizzesApi = {
  getAll:  (courseId)     => apiClient.get(`/courses/${courseId}/quizzes`),
  start:   (quizId)       => apiClient.post(`/quizzes/${quizId}/start`),
  submit:  (quizId, data) => apiClient.post(`/quizzes/${quizId}/submit`, data),
}

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

export const ratingsApi = {
  submit: (courseId, data) => apiClient.post(`/courses/${courseId}/rate`, data),
  get:    (courseId)       => apiClient.get(`/courses/${courseId}/rating`),
}

export const dashboardApi = {
  getStudentDashboard:    () => apiClient.get('/dashboard/student'),
  getInstructorDashboard: () => apiClient.get('/dashboard/instructor'),
  getAdminDashboard:      () => apiClient.get('/dashboard/admin'),
}

export const attendanceApi = {
  mark:              (data)     => apiClient.post('/attendance/mark', data),
  getStudentSummary: ()         => apiClient.get('/attendance/student'),
  getCourse:         (courseId) => apiClient.get(`/attendance/course/${courseId}`),
}

// channelId = courseId (broadcast) or courseId__studentId (private)
export const chatApi = {
  getMessages: (channelId, since) =>
    apiClient.get(`/chat/${channelId}/messages`, { params: since ? { since } : {} }),
  send: (channelId, text) =>
    apiClient.post(`/chat/${channelId}/messages`, { text }),
}

export const categoriesApi = {
  getAll:  (params = {}) => apiClient.get('/categories', { params }),
  create:  (data)        => apiClient.post('/categories', data),
  update:  (id, data)    => apiClient.put(`/categories/${id}`, data),
  delete:  (id)          => apiClient.delete(`/categories/${id}`),
}

export const analyticsApi = {
  getEngagement:      (params = {}) => apiClient.get('/analytics/engagement', { params }),
  getCourseAnalytics: (courseId, params = {}) => apiClient.get(`/courses/${courseId}/analytics`, { params }),
}

export { coursesApi } from './courses'
