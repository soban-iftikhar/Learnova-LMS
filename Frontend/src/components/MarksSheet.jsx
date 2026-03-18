import React, { useState, useEffect } from 'react';
import { Download, Trash2, Unlock, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';
import { useToast } from './common/Toast';

/**
 * Marks Sheet component - Shows all student attempts for a quiz
 * Teachers can download as PDF or delete the marks
 */
export default function MarksSheet({ quizId, quizTitle, onClose }) {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchMarksSheet();
  }, [quizId]);

  const fetchMarksSheet = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/quizzes/${quizId}/marks-sheet`);
      setMarks(response.data.marks_sheet || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load marks sheet');
      toast?.error('Failed to load marks sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockStudent = async (studentId) => {
    try {
      await apiClient.post(`/quizzes/${quizId}/unlock-student/${studentId}`);
      toast?.success(`Quiz unlocked for student`);
      fetchMarksSheet()
    } catch (err) {
      toast?.error('Failed to unlock quiz');
    }
  };

  const handleUnlockAll = async () => {
    if (!window.confirm('Unlock this quiz for all students?')) return;
    try {
      await apiClient.post(`/quizzes/${quizId}/unlock-all`);
      toast?.success('Quiz unlocked for all students');
      fetchMarksSheet();
    } catch (err) {
      toast?.error('Failed to unlock quiz');
    }
  };

  const handleDeleteMarksSheet = async () => {
    if (!window.confirm('Delete all marks for this quiz? This cannot be undone.')) return;
    try {
      await apiClient.delete(`/quizzes/${quizId}/marks-sheet`);
      toast?.success('Marks sheet deleted');
      onClose();
    } catch (err) {
      toast?.error('Failed to delete marks sheet');
    }
  };

  const handleDownloadPDF = () => {
    // Generate PDF content
    const docContent = generatePDFContent();
    
    // Create blob and download
    const blob = new Blob([docContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quizTitle}-marks-sheet.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast?.success('Marks sheet downloaded');
  };

  const generatePDFContent = () => {
    const totalAttempts = marks.length;
    const averageScore = marks.length > 0 
      ? (marks.reduce((sum, m) => sum + (m.score || 0), 0) / marks.length).toFixed(2)
      : 0;
    const passCount = marks.filter(m => m.passed).length;
    const passPercentage = totalAttempts > 0 
      ? ((passCount / totalAttempts) * 100).toFixed(2)
      : 0;

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${quizTitle} - Marks Sheet</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
        .summary { background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .summary-item { margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #007bff; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        tr:hover { background: #f5f5f5; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>${quizTitle} - Marks Sheet</h1>
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-item"><strong>Total Attempts:</strong> ${totalAttempts}</div>
        <div class="summary-item"><strong>Average Score:</strong> ${averageScore}</div>
        <div class="summary-item"><strong>Pass Count:</strong> ${passCount}/${totalAttempts} (${passPercentage}%)</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Email</th>
            <th>Score</th>
            <th>Max Score</th>
            <th>Percentage</th>
            <th>Status</th>
            <th>Attempted At</th>
          </tr>
        </thead>
        <tbody>
          ${marks.map(m => `
            <tr>
              <td>${m.student_name}</td>
              <td>${m.student_email}</td>
              <td>${m.score}</td>
              <td>${m.max_score}</td>
              <td>${m.percentage}%</td>
              <td class="${m.passed ? 'pass' : 'fail'}">${m.passed ? 'PASSED' : 'FAILED'}</td>
              <td>${new Date(m.attempted_at).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
    `;
    return html;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
          </div>
          <p className="text-center mt-4">Loading marks sheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{quizTitle} - Marks Sheet</h2>
          <button
            onClick={onClose}
            className="text-white text-2xl font-bold hover:bg-blue-800 p-2 rounded"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <AlertCircle className="text-red-500 mr-3" size={20} />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {marks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No attempts recorded yet</p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Total Attempts</p>
                  <p className="text-2xl font-bold text-blue-600">{marks.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{marks.filter(m => m.passed).length}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Failed</p>
                  <p className="text-2xl font-bold text-yellow-600">{marks.filter(m => !m.passed).length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Avg Score</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(marks.reduce((sum, m) => sum + (m.score || 0), 0) / marks.length).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Score</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">%</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Locked</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((mark, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{mark.student_name}</td>
                        <td className="px-4 py-3">{mark.student_email}</td>
                        <td className="px-4 py-3 text-center font-semibold">{mark.score}/{mark.max_score}</td>
                        <td className="px-4 py-3 text-center">{mark.percentage}%</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            mark.passed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {mark.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold ${
                            mark.is_locked ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {mark.is_locked ? '🔒 Locked' : '🔓 Unlocked'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {mark.is_locked && (
                            <button
                              onClick={() => handleUnlockStudent(mark.student_id)}
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                              title="Unlock quiz for this student"
                            >
                              <Unlock size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-100 border-t p-6 flex justify-between">
          <button
            onClick={handleUnlockAll}
            disabled={marks.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Unlock size={18} />
            Unlock All
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={marks.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              Download PDF
            </button>

            <button
              onClick={handleDeleteMarksSheet}
              disabled={marks.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              Delete Marks
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
