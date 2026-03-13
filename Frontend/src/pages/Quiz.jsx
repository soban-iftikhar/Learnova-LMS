import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    loadQuizData();
  }, [id]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      // Load quiz details
      const quizResponse = await courseService.getQuizDetails(id);
      setQuiz(quizResponse.data);

      // Load quiz questions
      const questionsResponse = await courseService.getQuizQuestions(id);
      setQuestions(questionsResponse.data);

      // Initialize answers object
      const initialAnswers = {};
      questionsResponse.data.forEach(q => {
        initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, selectedAnswer) => {
    setAnswers({
      ...answers,
      [questionId]: selectedAnswer,
    });
  };

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to submit the quiz?')) {
      try {
        const submissionData = {
          quizId: id,
          studentId: user?.id,
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId: parseInt(questionId),
            selectedAnswer: answer,
          })),
        };

        const response = await courseService.submitQuiz(id, submissionData);
        setResult(response.data);
        setSubmitted(true);
      } catch (error) {
        alert('Failed to submit quiz: ' + error.message);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-gray-600">Loading quiz...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">Quiz not found</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    const percentage = Math.round((result.score / result.totalPoints) * 100);
    const passed = percentage >= 60;

    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div
                className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${
                  passed ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                {passed ? (
                  <CheckCircle size={40} className="text-green-600" />
                ) : (
                  <AlertCircle size={40} className="text-red-600" />
                )}
              </div>

              <h1
                className={`text-4xl font-bold mb-2 ${
                  passed ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {passed ? 'Great Job!' : 'Keep Learning'}
              </h1>

              <p className="text-gray-600 text-lg">
                Your Quiz Score: <span className="font-bold">{percentage}%</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm">Score</p>
                <p className="text-2xl font-bold text-blue-600">
                  {result.score}/{result.totalPoints}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm">Questions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {result.correctAnswers}/{questions.length}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="font-bold text-lg text-gray-800">
                Questions Breakdown
              </h3>
              {questions.map((question, index) => {
                const isCorrect =
                  result.answeredCorrectly &&
                  result.answeredCorrectly[question.id];
                return (
                  <div
                    key={question.id}
                    className={`p-4 rounded-lg border ${
                      isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle
                          size={20}
                          className="text-green-600 flex-shrink-0 mt-1"
                        />
                      ) : (
                        <AlertCircle
                          size={20}
                          className="text-red-600 flex-shrink-0 mt-1"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 mb-2">
                          Q{index + 1}: {question.questionText}
                        </p>
                        <p className="text-sm text-gray-600">
                          Your answer:{' '}
                          <span className="font-semibold">
                            {answers[question.id] || 'Not answered'}
                          </span>
                        </p>
                        {!isCorrect && question.correctAnswer && (
                          <p className="text-sm text-gray-600 mt-1">
                            Correct answer:{' '}
                            <span className="font-semibold text-green-600">
                              {question.correctAnswer}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate('/courses')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No questions available</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answered = Object.values(answers).filter(a => a !== '').length;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={20} />
              <span>Time: {quiz.timeLimit || 'No limit'}</span>
            </div>
          </div>

          <p className="text-gray-600 mb-4">{quiz.description}</p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-gray-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <p className="text-sm font-semibold text-gray-700">
                {answered} answered
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {currentQuestion.questionText}
          </h2>

          {/* Answer Options */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options?.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  answers[currentQuestion.id] === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion.id, e.target.value)
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-4 text-gray-800">{option}</span>
              </label>
            ))}
          </div>

          {/* Question Navigator */}
          <div className="flex gap-2 flex-wrap mb-8">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-lg font-bold transition ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : answers[q.id]
                    ? 'bg-green-100 text-green-700 border-2 border-green-600'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            className="bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
