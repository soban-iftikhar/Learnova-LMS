package lms.learnova.Service;

import lms.learnova.DTOs.QuizDTO;
import lms.learnova.DTOs.QuizQuestionDTO;
import lms.learnova.DTOs.QuizStatisticsDTO;
import lms.learnova.Model.*;
import lms.learnova.Repository.*;
import lms.learnova.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizCreationService {
    private final QuizRepo quizRepo;
    private final QuizQuestionRepo questionRepo;
    private final CourseRepo courseRepo;
    private final InstructorRepo instructorRepo;

    public QuizCreationService(QuizRepo quizRepo, QuizQuestionRepo questionRepo,
                              CourseRepo courseRepo, InstructorRepo instructorRepo) {
        this.quizRepo = quizRepo;
        this.questionRepo = questionRepo;
        this.courseRepo = courseRepo;
        this.instructorRepo = instructorRepo;
    }

    // Create new quiz
    @Transactional
    public Quiz createQuiz(Long courseId, Long instructorId, QuizDTO quizDTO) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        Instructor instructor = instructorRepo.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

        // Verify instructor owns the course
        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new IllegalArgumentException("You can only create quizzes for your own courses");
        }

        Quiz quiz = new Quiz();
        quiz.setCourse(course);
        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setMaxScore(quizDTO.getMaxScore());
        quiz.setTimeLimitSeconds(quizDTO.getTimeLimitSeconds());
        quiz.setStartTime(quizDTO.getStartTime());
        quiz.setEndTime(quizDTO.getEndTime());
        quiz.setIsPublished(false);  // Draft until explicitly published
        quiz.setShuffleQuestions(false);
        quiz.setShuffleOptions(false);

        return quizRepo.save(quiz);
    }

    // Add question to quiz
    @Transactional
    public QuizQuestion addQuestionToQuiz(Long quizId, QuizQuestionDTO questionDTO) {
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        // Get next question order
        long nextOrder = questionRepo.countByQuizId(quizId) + 1;

        QuizQuestion question = new QuizQuestion();
        question.setQuiz(quiz);
        question.setQuestionText(questionDTO.getQuestionText());
        question.setOptionA(questionDTO.getOptionA());
        question.setOptionB(questionDTO.getOptionB());
        question.setOptionC(questionDTO.getOptionC());
        question.setOptionD(questionDTO.getOptionD());
        question.setCorrectAnswer(questionDTO.getCorrectAnswer());
        question.setMarks(questionDTO.getMarks());
        question.setQuestionOrder((int) nextOrder);

        return questionRepo.save(question);
    }

    // Update question
    @Transactional
    public QuizQuestion updateQuestion(Long questionId, QuizQuestionDTO questionDTO) {
        QuizQuestion question = questionRepo.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        question.setQuestionText(questionDTO.getQuestionText());
        question.setOptionA(questionDTO.getOptionA());
        question.setOptionB(questionDTO.getOptionB());
        question.setOptionC(questionDTO.getOptionC());
        question.setOptionD(questionDTO.getOptionD());
        question.setCorrectAnswer(questionDTO.getCorrectAnswer());
        question.setMarks(questionDTO.getMarks());

        return questionRepo.save(question);
    }

    // Delete question
    @Transactional
    public void deleteQuestion(Long questionId) {
        QuizQuestion question = questionRepo.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        questionRepo.delete(question);
    }

    // Reorder questions
    @Transactional
    public void reorderQuestions(Long quizId, List<Long> questionIds) {
        for (int i = 0; i < questionIds.size(); i++) {
            QuizQuestion question = questionRepo.findById(questionIds.get(i))
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
            question.setQuestionOrder(i + 1);
            questionRepo.save(question);
        }
    }

    // Publish quiz (make available to students)
    @Transactional
    public Quiz publishQuiz(Long quizId) {
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        // Validate quiz has at least one question
        long questionCount = questionRepo.countByQuizId(quizId);
        if (questionCount == 0) {
            throw new IllegalArgumentException("Quiz must have at least one question before publishing");
        }

        quiz.setIsPublished(true);
        return quizRepo.save(quiz);
    }

    // Unpublish quiz
    @Transactional
    public Quiz unpublishQuiz(Long quizId) {
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        quiz.setIsPublished(false);
        return quizRepo.save(quiz);
    }

    // Update quiz details
    @Transactional
    public Quiz updateQuiz(Long quizId, QuizDTO quizDTO) {
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setMaxScore(quizDTO.getMaxScore());
        quiz.setTimeLimitSeconds(quizDTO.getTimeLimitSeconds());
        quiz.setStartTime(quizDTO.getStartTime());
        quiz.setEndTime(quizDTO.getEndTime());

        return quizRepo.save(quiz);
    }

    // Delete quiz
    @Transactional
    public void deleteQuiz(Long quizId) {
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        quizRepo.delete(quiz);
    }

    // Get all quizzes for instructor's course (including unpublished)
    public List<Quiz> getQuizzesForCourse(Long courseId, Long instructorId) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Verify instructor owns the course
        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new IllegalArgumentException("You can only view quizzes for your own courses");
        }

        return quizRepo.findByCourseId(courseId);
    }

    // Get quiz details for editing
    public Quiz getQuizForEditing(Long quizId, Long instructorId) {
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        // Verify instructor owns the course
        if (!quiz.getCourse().getInstructor().getId().equals(instructorId)) {
            throw new IllegalArgumentException("You can only edit quizzes for your own courses");
        }

        return quiz;
    }

    // Get quiz statistics
    public QuizStatisticsDTO getQuizStatistics(Long quizId) {
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        // Calculate statistics (would need StudentAnswerRepo access)
        QuizStatisticsDTO stats = new QuizStatisticsDTO();
        stats.setQuizId(quizId);
        stats.setQuizTitle(quiz.getTitle());
        stats.setTotalQuestions(quiz.getQuestions().size());
        stats.setMaxScore(quiz.getMaxScore());

        return stats;
    }

    // Convert Quiz to DTO
    public QuizDTO convertToDTO(Quiz quiz) {
        QuizDTO dto = new QuizDTO();
        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setDescription(quiz.getDescription());
        dto.setMaxScore(quiz.getMaxScore());
        dto.setTimeLimitSeconds(quiz.getTimeLimitSeconds());
        dto.setStartTime(quiz.getStartTime());
        dto.setEndTime(quiz.getEndTime());
        dto.setIsPublished(quiz.getIsPublished());
        dto.setQuestionCount(quiz.getQuestions().size());
        return dto;
    }

    // Convert QuizQuestion to DTO
    public QuizQuestionDTO convertQuestionToDTO(QuizQuestion question) {
        QuizQuestionDTO dto = new QuizQuestionDTO();
        dto.setId(question.getId());
        dto.setQuestionText(question.getQuestionText());
        dto.setOptionA(question.getOptionA());
        dto.setOptionB(question.getOptionB());
        dto.setOptionC(question.getOptionC());
        dto.setOptionD(question.getOptionD());
        dto.setCorrectAnswer(question.getCorrectAnswer());
        dto.setMarks(question.getMarks());
        dto.setQuestionOrder(question.getQuestionOrder());
        return dto;
    }
}
