package lms.learnova.Controller;

import lms.learnova.DTOs.*;
import lms.learnova.Model.*;
import lms.learnova.Repository.QuizQuestionRepo;
import lms.learnova.Repository.UserRepo;
import lms.learnova.Service.QuizService;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * /courses/{courseId}/quizzes  — GET list (student-facing, published only)
 * /quizzes/{quizId}/start      — POST start attempt
 * /quizzes/{quizId}/submit     — POST submit answers
 *
 * Uses questionRepo.findByQuizIdOrderByQuestionOrder() instead of
 * quiz.getQuestions() to avoid LazyInitializationException (open-in-view=false).
 * Uses LinkedHashMap<String,Object> instead of Map.of() to avoid Java type
 * inference issues with mixed value types.
 */
@RestController
public class QuizzesApiController {

    private final QuizService      quizService;
    private final QuizQuestionRepo questionRepo;
    private final UserRepo         userRepo;

    public QuizzesApiController(QuizService quizService,
                                QuizQuestionRepo questionRepo,
                                UserRepo userRepo) {
        this.quizService  = quizService;
        this.questionRepo = questionRepo;
        this.userRepo     = userRepo;
    }

    // GET /courses/{courseId}/quizzes
    @GetMapping("/courses/{courseId}/quizzes")
    public ResponseEntity<?> getCourseQuizzes(@PathVariable Long courseId) {
        List<Map<String, Object>> quizzes = quizService.getQuizzesByCourse(courseId)
                .stream()
                .map(q -> {
                    long count = questionRepo.countByQuizId(q.getId());
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",              q.getId());
                    m.put("title",           q.getTitle());
                    m.put("description",     q.getDescription() != null ? q.getDescription() : "");
                    m.put("question_count",  count);
                    m.put("time_limit",      q.getTimeLimitSeconds() != null ? q.getTimeLimitSeconds() / 60 : 30);
                    m.put("pass_percentage", 70);
                    m.put("max_score",       q.getMaxScore() != null ? q.getMaxScore() : 100);
                    m.put("status",          Boolean.TRUE.equals(q.getIsPublished()) ? "ACTIVE" : "DRAFT");
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content", quizzes);
        return ResponseEntity.ok(resp);
    }

    // POST /quizzes/{quizId}/start
    @PostMapping("/quizzes/{quizId}/start")
    public ResponseEntity<?> startQuiz(@PathVariable Long quizId) {
        Long studentId = getCurrentUserId();
        Quiz quiz = quizService.getQuizWithQuestions(quizId);

        List<Map<String, Object>> questions = questionRepo
                .findByQuizIdOrderByQuestionOrder(quizId)
                .stream()
                .map(q -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",       q.getId());
                    m.put("question", q.getQuestionText());
                    List<String> opts = new ArrayList<>();
                    opts.add(q.getOptionA());
                    opts.add(q.getOptionB());
                    opts.add(q.getOptionC());
                    opts.add(q.getOptionD());
                    m.put("options",  opts);
                    m.put("type",     "MULTIPLE_CHOICE");
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("attempt_id", System.currentTimeMillis());
        body.put("quiz_id",    quizId);
        body.put("student_id", studentId);
        body.put("started_at", java.time.Instant.now().toString());
        body.put("time_limit", quiz.getTimeLimitSeconds() != null ? quiz.getTimeLimitSeconds() : 1800);
        body.put("questions",  questions);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
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

        boolean passed = result.getPercentage() != null && result.getPercentage() >= 70;

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("attempt_id",  body.getOrDefault("attempt_id", 0));
        resp.put("score",       result.getMarksObtained() != null ? result.getMarksObtained() : 0);
        resp.put("percentage",  result.getPercentage()    != null ? result.getPercentage()    : 0.0);
        resp.put("passed",      passed);
        resp.put("feedback",    passed ? "Great job! You passed the quiz." : "Keep studying and try again.");
        resp.put("submitted_at", java.time.Instant.now().toString());
        return ResponseEntity.ok(resp);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }

    private Long toLong(Object val) {
        if (val instanceof Integer) return ((Integer) val).longValue();
        if (val instanceof Long)    return (Long) val;
        return Long.parseLong(val.toString());
    }
}
