import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { quizAPI } from '../services/api'
import ProgressBar from '../components/ProgressBar'
import { AlertCircle, Loader, CheckCircle, XCircle } from 'lucide-react'

export default function QuizPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true)
        setError(null)
        const quizData = await quizAPI.getQuizDetails(quizId)
        setQuiz(quizData)
      } catch (err) {
        console.error('Error fetching quiz:', err)
        setError('Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    if (quizId) {
      fetchQuiz()
    }
  }, [quizId])

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length !== quiz.questions.length) {
      setError('Please answer all questions before submitting')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const submitData = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId: parseInt(questionId),
        selectedAnswer,
      }))

      const quizResult = await quizAPI.submitAnswers(quizId, user.id, submitData)
      setResult(quizResult)
      setSubmitted(true)
    } catch (err) {
      console.error('Error submitting quiz:', err)
      setError('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Quiz not found</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Courses
          </button>
        </div>
      </div>
    )
  }

  // Results View
  if (submitted && result) {
    const passed = result.passed
    const percentage = Math.round((result.score / 100) * 100) // Assuming score is already percentage

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              {passed ? (
                <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
              ) : (
                <XCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {passed ? 'Quiz Passed!' : 'Quiz Failed'}
              </h1>
              <p className="text-gray-600">
                {passed
                  ? `Great job! You scored ${percentage}%`
                  : `You scored ${percentage}%. Passing score: ${quiz.passingScore}%`}
              </p>
            </div>

            <div className="mb-8">
              <ProgressBar progress={percentage} label="Your Score" />
            </div>

            <div className="space-y-4 mb-8">
              {result.details?.map((detail, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    detail.isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {detail.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Question {idx + 1}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your answer: <span className="font-semibold">{detail.studentAnswer}</span>
                      </p>
                      {!detail.isCorrect && (
                        <p className="text-sm text-green-700 mt-1">
                          Correct answer: <span className="font-semibold">{detail.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/courses')}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Back to Courses
              </button>
              {!passed && (
                <button
                  onClick={() => {
                    setAnswers({})
                    setSubmitted(false)
                    setResult(null)
                  }}
                  className="flex-1 py-2 px-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Retake Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Quiz Form View
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Passing Score: <span className="font-semibold">{quiz.passingScore}%</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Progress */}
          <div className="mb-8">
            <ProgressBar
              progress={(Object.keys(answers).length / quiz.questions.length) * 100}
              label="Quiz Progress"
            />
          </div>

          {/* Questions */}
          <div className="space-y-8 mb-8">
            {quiz.questions?.map((question, idx) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">
                  Question {idx + 1}: {question.questionText}
                </h3>

                {question.questionType === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-3">
                    {question.options?.map((option, optIdx) => (
                      <label key={optIdx} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() => handleAnswerChange(question.id, option)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.questionType === 'SHORT_ANSWER' && (
                  <input
                    type="text"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting || Object.keys(answers).length !== quiz.questions?.length}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader className="w-4 h-4 animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
