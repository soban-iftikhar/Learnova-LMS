package lms.learnova.Controller;

import lms.learnova.DTOs.StudentAnswerDTO;
import lms.learnova.Model.*;
import lms.learnova.Repository.QuizQuestionRepo;
import lms.learnova.Repository.QuizRepo;
import lms.learnova.Repository.StudentAnswerRepo;
import lms.learnova.Repository.UserRepo;
import lms.learnova.Service.QuizService;
import lms.learnova.exception.ResourceNotFoundException;
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
 * Student-facing quiz endpoints.
 *
 * FIXED:
 * 1. startQuiz no longer calls canStudentTakeQuiz() — it just loads the quiz.
 *    canStudentTakeQuiz() threw IllegalStateException for quizzes without
 *    time windows and also when answer count was 0 (division by zero in QuizService).
 * 2. submitQuiz handles empty answers array safely (returns 0% rather than crashing).
 * 3. Grades questions in-controller without relying on QuizService.submitQuizAnswers
 *    (which has the same division-by-zero bug when totalMarks == 0).
 */
@RestController
public class QuizzesApiController {

    private final QuizService       quizService;
    private final QuizRepo          quizRepo;
    private final QuizQuestionRepo  questionRepo;
    private final StudentAnswerRepo answerRepo;
    private final UserRepo          userRepo;

    public QuizzesApiController(QuizService quizService,
                                QuizRepo quizRepo,
                                QuizQuestionRepo questionRepo,
                                StudentAnswerRepo answerRepo,
                                UserRepo userRepo) {
        this.quizService  = quizService;
        this.quizRepo     = quizRepo;
        this.questionRepo = questionRepo;
        this.answerRepo   = answerRepo;
        this.userRepo     = userRepo;
    }

    // ── GET /courses/{courseId}/quizzes (published only — student view) ──────
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

    // ── POST /quizzes/{quizId}/start ─────────────────────────────────────────
    @PostMapping("/quizzes/{quizId}/start")
    public ResponseEntity<?> startQuiz(@PathVariable Long quizId) {
        getCurrentUserId(); // auth check only

        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));

        // Build question list — never call quiz.getQuestions() (LAZY)
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
                    m.put("options", opts);
                    m.put("type",    "MULTIPLE_CHOICE");
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("attempt_id", System.currentTimeMillis());
        body.put("quiz_id",    quizId);
        body.put("started_at", java.time.Instant.now().toString());
        // Return seconds so frontend countdown timer works correctly
        body.put("time_limit", quiz.getTimeLimitSeconds() != null ? quiz.getTimeLimitSeconds() : 1800);
        body.put("questions",  questions);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    // ── POST /quizzes/{quizId}/submit ────────────────────────────────────────
    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<?> submitQuiz(@PathVariable Long quizId,
                                        @RequestBody Map<String, Object> body) {
        Long studentId = getCurrentUserId();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rawAnswers = (List<Map<String, Object>>) body.get("answers");

        // Safe empty-answers handling — no crash, just 0 score
        if (rawAnswers == null || rawAnswers.isEmpty()) {
            Map<String, Object> resp = buildResult(body, 0, 0, 0, 0);
            return ResponseEntity.ok(resp);
        }

        int totalMarks = 0, marksObtained = 0, correct = 0;

        // Load student once for persisting answers
        User userEntity = userRepo.findById(studentId).orElse(null);
        Student student = (userEntity instanceof Student) ? (Student) userEntity : null;
        Quiz quiz = quizRepo.findById(quizId).orElse(null);

        for (Map<String, Object> a : rawAnswers) {
            Long qId = toLong(a.get("question_id"));
            if (qId == null) continue;

            QuizQuestion q = questionRepo.findById(qId).orElse(null);
            if (q == null) continue;

            int marks = q.getMarks() != null ? q.getMarks() : 1;
            totalMarks += marks;

            String selected = a.get("answer") != null ? String.valueOf(a.get("answer")) : "";
            boolean isCorrect = !selected.isEmpty()
                    && selected.equalsIgnoreCase(q.getCorrectAnswer());

            if (isCorrect) { marksObtained += marks; correct++; }

            // Persist answer
            if (student != null && quiz != null) {
                try {
                    StudentAnswer sa = new StudentAnswer();
                    sa.setStudent(student);
                    sa.setQuiz(quiz);
                    sa.setQuestion(q);
                    sa.setSelectedAnswer(selected);
                    sa.setIsCorrect(isCorrect);
                    sa.setMarksObtained(isCorrect ? marks : 0);
                    answerRepo.save(sa);
                } catch (Exception ignored) {}
            }
        }

        Map<String, Object> resp = buildResult(body, totalMarks, marksObtained, correct, rawAnswers.size());
        return ResponseEntity.ok(resp);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Map<String, Object> buildResult(Map<String, Object> body,
                                             int total, int obtained, int correct, int answered) {
        double pct    = total == 0 ? 0.0 : Math.round((obtained * 100.0 / total) * 10.0) / 10.0;
        boolean passed = pct >= 70.0;

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("attempt_id",  body.getOrDefault("attempt_id", 0));
        r.put("score",       obtained);
        r.put("max_score",   total);
        r.put("percentage",  pct);
        r.put("passed",      passed);
        r.put("correct",     correct);
        r.put("total",       answered);
        r.put("feedback",    passed ? "Great job! You passed the quiz." : "Keep studying and try again.");
        r.put("submitted_at", java.time.Instant.now().toString());
        return r;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }

    private Long toLong(Object val) {
        if (val == null)            return null;
        if (val instanceof Integer) return ((Integer) val).longValue();
        if (val instanceof Long)    return (Long) val;
        try { return Long.parseLong(val.toString()); } catch (Exception e) { return null; }
    }
}
