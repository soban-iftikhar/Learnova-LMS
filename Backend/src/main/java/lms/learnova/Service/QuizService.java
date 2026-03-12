package lms.learnova.Service;

import lms.learnova.DTOs.QuizResultDTO;
import lms.learnova.DTOs.StudentAnswerDTO;
import lms.learnova.Model.*;
import lms.learnova.Repository.*;
import lms.learnova.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizService {
    private final QuizRepo quizRepo;
    private final QuizQuestionRepo questionRepo;
    private final StudentAnswerRepo answerRepo;
    private final StudentRepo studentRepo;

    public QuizService(QuizRepo quizRepo, QuizQuestionRepo questionRepo, 
                       StudentAnswerRepo answerRepo, StudentRepo studentRepo) {
        this.quizRepo = quizRepo;
        this.questionRepo = questionRepo;
        this.answerRepo = answerRepo;
        this.studentRepo = studentRepo;
    }

    // Get all published quizzes for a course
    public List<Quiz> getQuizzesByCourse(Long courseId) {
        return quizRepo.findByCourseIdAndIsPublishedTrue(courseId);
    }

    // Get specific quiz with questions
    public Quiz getQuizWithQuestions(Long quizId) {
        return quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
    }

    // Get quiz questions
    public List<QuizQuestion> getQuizQuestions(Long quizId) {
        return questionRepo.findByQuizIdOrderByQuestionOrder(quizId);
    }

    // Check if student can take quiz (time window check)
    public boolean canStudentTakeQuiz(Long quizId) {
        Quiz quiz = getQuizWithQuestions(quizId);
        LocalDateTime now = LocalDateTime.now();
        
        boolean withinTimeWindow = (quiz.getStartTime() == null || now.isAfter(quiz.getStartTime())) &&
                                  (quiz.getEndTime() == null || now.isBefore(quiz.getEndTime()));
        return quiz.getIsPublished() && withinTimeWindow;
    }

    // Submit student answers and calculate score
    @Transactional
    public QuizResultDTO submitQuizAnswers(Long studentId, Long quizId, List<StudentAnswerDTO> answers) {
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        Quiz quiz = getQuizWithQuestions(quizId);
        
        // Verify quiz is available
        if (!canStudentTakeQuiz(quizId)) {
            throw new IllegalStateException("Quiz is not available for submission");
        }

        int totalMarks = 0;
        int marksObtained = 0;
        int correctAnswers = 0;

        // Process each answer
        for (StudentAnswerDTO answerDTO : answers) {
            QuizQuestion question = questionRepo.findById(answerDTO.getQuestionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

            // Calculate marks
            int questionMarks = question.getMarks();
            totalMarks += questionMarks;

            boolean isCorrect = answerDTO.getSelectedAnswer() != null && 
                               answerDTO.getSelectedAnswer().equals(question.getCorrectAnswer());
            
            int marksForThisQuestion = isCorrect ? questionMarks : 0;
            if (isCorrect) correctAnswers++;

            // Save student answer
            StudentAnswer studentAnswer = new StudentAnswer();
            studentAnswer.setStudent(student);
            studentAnswer.setQuiz(quiz);
            studentAnswer.setQuestion(question);
            studentAnswer.setSelectedAnswer(answerDTO.getSelectedAnswer());
            studentAnswer.setIsCorrect(isCorrect);
            studentAnswer.setMarksObtained(marksForThisQuestion);
            
            answerRepo.save(studentAnswer);
            marksObtained += marksForThisQuestion;
        }

        // Build result DTO
        QuizResultDTO result = new QuizResultDTO();
        result.setQuizId(quizId);
        result.setQuizTitle(quiz.getTitle());
        result.setMarksObtained(marksObtained);
        result.setMaxMarks(totalMarks);
        result.setPercentage((double) (marksObtained * 100) / totalMarks);
        result.setTotalQuestions(answers.size());
        result.setCorrectAnswers(correctAnswers);
        result.setSubmittedAt(LocalDateTime.now());

        return result;
    }

    // Get student's quiz result
    public QuizResultDTO getStudentQuizResult(Long studentId, Long quizId) {
        List<StudentAnswer> answers = answerRepo.findByStudentIdAndQuizId(studentId, quizId);
        
        if (answers.isEmpty()) {
            throw new ResourceNotFoundException("Quiz result not found");
        }

        Quiz quiz = getQuizWithQuestions(quizId);
        
        int marksObtained = answers.stream().mapToInt(StudentAnswer::getMarksObtained).sum();
        int maxMarks = answers.stream().mapToInt(a -> a.getQuestion().getMarks()).sum();
        long correctCount = answers.stream().filter(StudentAnswer::getIsCorrect).count();

        QuizResultDTO result = new QuizResultDTO();
        result.setQuizId(quizId);
        result.setQuizTitle(quiz.getTitle());
        result.setMarksObtained(marksObtained);
        result.setMaxMarks(maxMarks);
        result.setPercentage((double) (marksObtained * 100) / maxMarks);
        result.setTotalQuestions(answers.size());
        result.setCorrectAnswers((int) correctCount);
        result.setSubmittedAt(answers.get(0).getSubmittedAt());

        return result;
    }

    // Get all quiz results for a student in a course
    public List<QuizResultDTO> getStudentQuizResultsByCourse(Long studentId, Long courseId) {
        List<Quiz> quizzes = getQuizzesByCourse(courseId);
        
        return quizzes.stream()
                .map(quiz -> {
                    try {
                        return getStudentQuizResult(studentId, quiz.getId());
                    } catch (ResourceNotFoundException e) {
                        return null;
                    }
                })
                .filter(result -> result != null)
                .collect(Collectors.toList());
    }
}
