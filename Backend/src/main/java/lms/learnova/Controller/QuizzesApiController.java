package lms.learnova.Controller;

import lms.learnova.DTOs.*;
import lms.learnova.Model.*;
import lms.learnova.Repository.UserRepo;
import lms.learnova.Service.QuizService;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * /courses/{courseId}/quizzes  — GET list
 * /quizzes/{quizId}/start      — POST start attempt
 * /quizzes/{quizId}/submit     — POST submit answers
 *
 * Aligned with frontend API docs.
 */
@RestController
public class QuizzesApiController {

    private final QuizService quizService;
    private final UserRepo userRepo;

    public QuizzesApiController(QuizService quizService, UserRepo userRepo) {
        this.quizService = quizService;
        this.userRepo = userRepo;
    }

    // GET /courses/{courseId}/quizzes
    @GetMapping("/courses/{courseId}/quizzes")
    public ResponseEntity<?> getCourseQuizzes(@PathVariable Long courseId) {
        List<Map<String, Object>> quizzes = quizService.getQuizzesByCourse(courseId)
                .stream()
                .map(q -> Map.<String, Object>of(
                        "id",               q.getId(),
                        "title",            q.getTitle(),
                        "description",      q.getDescription() != null ? q.getDescription() : "",
                        "question_count",   q.getQuestions() != null ? q.getQuestions().size() : 0,
                        "time_limit",       q.getTimeLimitSeconds() != null ? q.getTimeLimitSeconds() / 60 : 30,
                        "pass_percentage",  70,
                        "status",           Boolean.TRUE.equals(q.getIsPublished()) ? "ACTIVE" : "DRAFT"
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("content", quizzes));
    }

    // POST /quizzes/{quizId}/start
    @PostMapping("/quizzes/{quizId}/start")
    public ResponseEntity<?> startQuiz(@PathVariable Long quizId) {
        Long studentId = getCurrentUserId();
        Quiz quiz = quizService.getQuizWithQuestions(quizId);

        List<Map<String, Object>> questions = quiz.getQuestions().stream()
                .map(q -> Map.<String, Object>of(
                        "id",       q.getId(),
                        "question", q.getQuestionText(),
                        "options",  List.of(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()),
                        "type",     "MULTIPLE_CHOICE"
                ))
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "attempt_id",  System.currentTimeMillis(),   // synthetic until attempt table added
                "quiz_id",     quizId,
                "student_id",  studentId,
                "started_at",  java.time.Instant.now().toString(),
                "questions",   questions
        ));
    }

    // POST /quizzes/{quizId}/submit
    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<?> submitQuiz(@PathVariable Long quizId,
                                        @RequestBody Map<String, Object> body) {
        Long studentId = getCurrentUserId();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rawAnswers = (List<Map<String, Object>>) body.get("answers");
        List<StudentAnswerDTO> answers = rawAnswers == null ? List.of() : rawAnswers.stream()
                .map(a -> {
                    StudentAnswerDTO dto = new StudentAnswerDTO();
                    dto.setQuestionId(toLong(a.get("question_id")));
                    dto.setSelectedAnswer(String.valueOf(a.get("answer")));
                    return dto;
                })
                .collect(Collectors.toList());

        QuizResultDTO result = quizService.submitQuizAnswers(studentId, quizId, answers);

        return ResponseEntity.ok(Map.of(
                "attempt_id",   body.getOrDefault("attempt_id", 0),
                "score",        result.getMarksObtained() != null ? result.getMarksObtained() : 0,
                "percentage",   result.getPercentage() != null ? result.getPercentage() : 0.0,
                "passed",       result.getPercentage() != null && result.getPercentage() >= 70,
                "feedback",     result.getPercentage() != null && result.getPercentage() >= 70
                                    ? "Great job! You passed the quiz." : "Keep studying and try again.",
                "submitted_at", java.time.Instant.now().toString()
        ));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }

    private Long toLong(Object val) {
        if (val instanceof Integer) return ((Integer) val).longValue();
        if (val instanceof Long) return (Long) val;
        return Long.parseLong(val.toString());
    }
}
