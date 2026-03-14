import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'

export default function QuizPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 minutes

  useEffect(() => {
    setTimeout(() => {
      setQuiz({
        id: quizId,
        title: 'React Basics Quiz',
        totalQuestions: 10,
        passingScore: 70,
        questions: [
          {
            id: 1,
            text: 'What is React?',
            options: [
              'A JavaScript library for building UIs',
              'A backend framework',
              'A database',
              'A CSS framework',
            ],
            correctAnswer: 0,
          },
          {
            id: 2,
            text: 'What are components in React?',
            options: [
              'Reusable pieces of UI',
              'Database tables',
              'Server endpoints',
              'API keys',
            ],
            correctAnswer: 0,
          },
          {
            id: 3,
            text: 'What is JSX?',
            options: [
              'A syntax extension for JavaScript',
              'A programming language',
              'A style preprocessor',
              'A bundler',
            ],
            correctAnswer: 0,
          },
          {
            id: 4,
            text: 'What is state in React?',
            options: [
              'Data that changes over time',
              'Static data',
              'A CSS property',
              'A database field',
            ],
            correctAnswer: 0,
          },
          {
            id: 5,
            text: 'What are props?',
            options: [
              'Data passed to components',
              'Component properties stored in state',
              'CSS classes',
              'Database columns',
            ],
            correctAnswer: 0,
          },
          {
            id: 6,
            text: 'What is the virtual DOM?',
            options: [
              "React's in-memory representation of UI",
              'The browser DOM',
              'A programming language',
              'A CSS concept',
            ],
            correctAnswer: 0,
          },
          {
            id: 7,
            text: 'What are hooks?',
            options: [
              'Functions that let you use state',
              'Database connections',
              'HTTP methods',
              'CSS animations',
            ],
            correctAnswer: 0,
          },
          {
            id: 8,
            text: 'What is useState?',
            options: [
              'A hook for managing state',
              'A router function',
              'A fetch method',
              'A styling tool',
            ],
            correctAnswer: 0,
          },
          {
            id: 9,
            text: 'What is useEffect?',
            options: [
              'A hook for side effects',
              'A state management tool',
              'A router',
              'A form validator',
            ],
            correctAnswer: 0,
          },
          {
            id: 10,
            text: 'What is React Router?',
            options: [
              'A library for navigation',
              'A state management tool',
              'A component library',
              'A styling solution',
            ],
            correctAnswer: 0,
          },
        ],
      })
      setLoading(false)
    }, 500)
  }, [quizId])

  useEffect(() => {
    if (!submitted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((t) => t - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [submitted, timeRemaining])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex,
    })
  }

  const handleSubmit = () => {
    const correctAnswers = quiz.questions.filter(
      (q) => answers[q.id] === q.correctAnswer
    ).length

    const calculatedScore = Math.round((correctAnswers / quiz.questions.length) * 100)
    setScore(calculatedScore)
    setSubmitted(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-600">Quiz not found</p>
      </div>
    )
  }

  if (submitted) {
    const passed = score >= quiz.passingScore
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card p-12 text-center">
          <div
            className={`inline-block w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <span className={`text-4xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {score}%
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </h1>

          <p className="text-gray-600 mb-8">
            {passed
              ? `You passed with a score of ${score}%`
              : `You scored ${score}%. You need ${quiz.passingScore}% to pass.`}
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/student/courses')}
              className="btn-primary w-full"
            >
              Back to Courses
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-outline w-full"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="card p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <div className="flex items-center space-x-2 text-red-600 font-semibold">
            <Clock size={20} />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{question.text}</h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, index)}
                className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                  answers[question.id] === index
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center space-x-3">
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[question.id] === index
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {answers[question.id] === index && (
                      <span className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </span>
                  <span className="text-gray-900">{option}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button onClick={handleSubmit} className="btn-primary">
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="btn-primary"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
