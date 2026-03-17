package lms.learnova.Controller;

import lms.learnova.Model.*;
import lms.learnova.Repository.*;
import lms.learnova.Service.QuizService;
import lms.learnova.exception.ResourceNotFoundException;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Student-facing quiz endpoints.
 * Quiz results (StudentAnswer rows) are persisted to DB.
 * Handles the uniqueConstraint on (student_id, quiz_id, question_id) by
 * using INSERT-or-UPDATE semantics.
 */
@RestController
public class QuizzesApiController {

    private final QuizService       quizService;
    private final QuizRepo          quizRepo;
    private final QuizQuestionRepo  questionRepo;
    private final StudentAnswerRepo answerRepo;
    private final StudentRepo       studentRepo;
    private final UserRepo          userRepo;
    private final QuizAttemptRepo   quizAttemptRepo;

    public QuizzesApiController(QuizService quizService, QuizRepo quizRepo,
                                QuizQuestionRepo questionRepo, StudentAnswerRepo answerRepo,
                                StudentRepo studentRepo, UserRepo userRepo, QuizAttemptRepo quizAttemptRepo) {
        this.quizService  = quizService;
        this.quizRepo     = quizRepo;
        this.questionRepo = questionRepo;
        this.answerRepo   = answerRepo;
        this.studentRepo  = studentRepo;
        this.userRepo     = userRepo;
        this.quizAttemptRepo = quizAttemptRepo;
    }

    // GET /courses/{courseId}/quizzes  — published only (student view)
    @GetMapping("/courses/{courseId}/quizzes")
    public ResponseEntity<?> getCourseQuizzes(@PathVariable Long courseId) {
        Long studentId = getCurrentUserId();
        
        List<Map<String, Object>> quizzes = quizService.getQuizzesByCourse(courseId)
                .stream().map(q -> {
                    long count   = questionRepo.countByQuizId(q.getId());
                    int  seconds = (q.getTimeLimitSeconds() != null && q.getTimeLimitSeconds() > 0)
                                   ? q.getTimeLimitSeconds() : 1800;
                    
                    // Check if student has already attempted this quiz
                    Optional<QuizAttempt> attempt = quizAttemptRepo.findByStudentIdAndQuizId(studentId, q.getId());
                    boolean isLocked = attempt.filter(QuizAttempt::getIsLocked).isPresent();
                    Integer attemptedScore = attempt.map(QuizAttempt::getScore).orElse(null);
                    Integer attemptedMaxScore = attempt.map(QuizAttempt::getMaxScore).orElse(null);
                    
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",              q.getId());
                    m.put("title",           q.getTitle());
                    m.put("description",     q.getDescription() != null ? q.getDescription() : "");
                    m.put("question_count",  count);
                    m.put("time_limit",      seconds / 60);
                    m.put("pass_percentage", 70);
                    m.put("max_score",       q.getMaxScore() != null ? q.getMaxScore() : 100);
                    m.put("status",          isLocked ? "LOCKED" : "ACTIVE");
                    m.put("is_locked",       isLocked);
                    m.put("attempted",       attempt.isPresent());
                    if (attemptedScore != null) {
                        m.put("attempted_score", attemptedScore);
                        m.put("attempted_max_score", attemptedMaxScore);
                    }
                    return m;
                }).collect(Collectors.toList());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content", quizzes);
        return ResponseEntity.ok(resp);
    }

    // POST /quizzes/{quizId}/start
    @PostMapping("/quizzes/{quizId}/start")
    public ResponseEntity<?> startQuiz(@PathVariable Long quizId) {
        Long studentId = getCurrentUserId();
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));
        
        // Check if quiz is already attempt and locked
        Optional<QuizAttempt> attempt = quizAttemptRepo.findByStudentIdAndQuizId(studentId, quizId);
        if (attempt.isPresent() && attempt.get().getIsLocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Quiz already attempted and locked. Teacher must unlock to retry."));
        }

        List<Map<String, Object>> questions = questionRepo
                .findByQuizIdOrderByQuestionOrder(quizId).stream()
                .map(q -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",       q.getId());
                    m.put("question", q.getQuestionText());
                    m.put("options",  List.of(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()));
                    m.put("type",     "MULTIPLE_CHOICE");
                    return m;
                }).collect(Collectors.toList());

        int seconds = (quiz.getTimeLimitSeconds() != null && quiz.getTimeLimitSeconds() > 0)
                      ? quiz.getTimeLimitSeconds() : 1800;

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("attempt_id", System.currentTimeMillis());
        body.put("quiz_id",    quizId);
        body.put("started_at", java.time.Instant.now().toString());
        body.put("time_limit", seconds);
        body.put("questions",  questions);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    // POST /quizzes/{quizId}/submit
    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<?> submitQuiz(@PathVariable Long quizId,
                                        @RequestBody Map<String, Object> body) {
        Long studentId = getCurrentUserId();

        // Resolve student entity for DB persistence
        Student student = studentRepo.findById(studentId).orElse(null);
        Quiz    quiz    = quizRepo.findById(quizId).orElse(null);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rawAnswers = (List<Map<String, Object>>) body.get("answers");

        if (rawAnswers == null || rawAnswers.isEmpty()) {
            return ResponseEntity.ok(buildResult(body, 0, 0, 0, 0));
        }

        int totalMarks = 0, marksObtained = 0, correct = 0;

        for (Map<String, Object> a : rawAnswers) {
            Long qId = toLong(a.get("question_id"));
            if (qId == null) continue;
            QuizQuestion q = questionRepo.findById(qId).orElse(null);
            if (q == null) continue;

            int marks   = q.getMarks() != null ? q.getMarks() : 1;
            totalMarks += marks;
            String sel  = a.get("answer") != null ? String.valueOf(a.get("answer")) : "";
            boolean ok  = !sel.isEmpty() && sel.equalsIgnoreCase(q.getCorrectAnswer());
            if (ok) { marksObtained += marks; correct++; }

            // Persist to DB — handle uniqueConstraint by upsert
            if (student != null && quiz != null) {
                try {
                    StudentAnswer sa = answerRepo
                            .findByStudentIdAndQuizIdAndQuestionId(studentId, quizId, qId)
                            .orElse(null);
                    if (sa == null) {
                        sa = new StudentAnswer();
                        sa.setStudent(student);
                        sa.setQuiz(quiz);
                        sa.setQuestion(q);
                    }
                    sa.setSelectedAnswer(sel);
                    sa.setIsCorrect(ok);
                    sa.setMarksObtained(ok ? marks : 0);
                    answerRepo.save(sa);
                } catch (Exception ignored) {
                    // duplicate key on retry — safe to ignore
                }
            }
        }

        // Record quiz attempt (lock for future attempts)
        if (student != null && quiz != null) {
            Optional<QuizAttempt> existingAttempt = quizAttemptRepo.findByStudentIdAndQuizId(studentId, quizId);
            QuizAttempt attempt = existingAttempt.orElse(new QuizAttempt());
            attempt.setStudent(student);
            attempt.setQuiz(quiz);
            attempt.setScore(marksObtained);
            attempt.setMaxScore(totalMarks);
            attempt.setIsLocked(true); // Locked by default
            quizAttemptRepo.save(attempt);
        }

        return ResponseEntity.ok(buildResult(body, totalMarks, marksObtained, correct, rawAnswers.size()));
    }

    // GET /courses/{courseId}/quiz-results  — teacher sees all results for a course
    @GetMapping("/courses/{courseId}/quiz-results")
    public ResponseEntity<?> getCourseQuizResults(@PathVariable Long courseId) {
        List<Quiz> quizzes = quizRepo.findByCourseId(courseId);
        List<Map<String, Object>> results = new ArrayList<>();

        for (Quiz quiz : quizzes) {
            List<StudentAnswer> answers = answerRepo.findByQuizId(quiz.getId());
            // Group by student
            Map<Long, List<StudentAnswer>> byStudent = answers.stream()
                    .collect(Collectors.groupingBy(sa -> sa.getStudent().getId()));

            for (Map.Entry<Long, List<StudentAnswer>> entry : byStudent.entrySet()) {
                List<StudentAnswer> studentAnswers = entry.getValue();
                int total    = studentAnswers.stream().mapToInt(sa -> sa.getQuestion() != null
                        ? (sa.getQuestion().getMarks() != null ? sa.getQuestion().getMarks() : 1) : 1).sum();
                int obtained = studentAnswers.stream().mapToInt(sa -> sa.getMarksObtained() != null
                        ? sa.getMarksObtained() : 0).sum();
                long correct2 = studentAnswers.stream().filter(sa -> Boolean.TRUE.equals(sa.getIsCorrect())).count();
                double pct   = total > 0 ? Math.round(obtained * 100.0 / total * 10.0) / 10.0 : 0.0;

                StudentAnswer first = studentAnswers.get(0);
                Map<String, Object> r = new LinkedHashMap<>();
                r.put("student_id",    entry.getKey());
                r.put("student_name",  first.getStudent().getName());
                r.put("student_email", first.getStudent().getEmail());
                r.put("quiz_id",       quiz.getId());
                r.put("quiz_title",    quiz.getTitle());
                r.put("score",         obtained);
                r.put("max_score",     total);
                r.put("percentage",    pct);
                r.put("correct",       correct2);
                r.put("total",         studentAnswers.size());
                r.put("passed",        pct >= 70.0);
                r.put("submitted_at",  first.getSubmittedAt() != null ? first.getSubmittedAt().toString() : "");
                results.add(r);
            }
        }

        // Sort by submitted_at desc
        results.sort((a, b) -> String.valueOf(b.get("submitted_at"))
                .compareTo(String.valueOf(a.get("submitted_at"))));

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content", results);
        resp.put("total",   results.size());
        return ResponseEntity.ok(resp);
    }

    // GET /quizzes/{quizId}/marks-sheet — teacher sees all student attempts (marks sheet)
    @Transactional
    @GetMapping("/quizzes/{quizId}/marks-sheet")
    public ResponseEntity<?> getMarksSheet(@PathVariable Long quizId) {
        List<QuizAttempt> attempts = quizAttemptRepo.findByQuizId(quizId);
        
        List<Map<String, Object>> sheet = attempts.stream().map(qa -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("attempt_id",    qa.getId());
            m.put("student_id",    qa.getStudent().getId());
            m.put("student_name",  qa.getStudent().getName());
            m.put("student_email", qa.getStudent().getEmail());
            m.put("score",         qa.getScore());
            m.put("max_score",     qa.getMaxScore());
            double pct = qa.getMaxScore() > 0 ? Math.round(qa.getScore() * 100.0 / qa.getMaxScore() * 10.0) / 10.0 : 0;
            m.put("percentage",    pct);
            m.put("passed",        pct >= 70.0);
            m.put("attempted_at",  qa.getAttemptedAt() != null ? qa.getAttemptedAt().toString() : "");
            m.put("is_locked",     qa.getIsLocked());
            return m;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(Map.of(
            "quiz_id", quizId,
            "total_attempts", attempts.size(),
            "marks_sheet", sheet
        ));
    }

    // POST /quizzes/{quizId}/unlock-student/{studentId} — teacher unlocks quiz for specific student
    @Transactional
    @PostMapping("/quizzes/{quizId}/unlock-student/{studentId}")
    public ResponseEntity<?> unlockQuizForStudent(@PathVariable Long quizId, @PathVariable Long studentId) {
        getCurrentUserId(); // Verify teacher is authenticated
        
        quizAttemptRepo.unlockQuizForStudent(studentId, quizId);
        return ResponseEntity.ok(Map.of("message", "Quiz unlocked for student"));
    }

    // POST /quizzes/{quizId}/unlock-all — teacher unlocks quiz for all students
    @Transactional
    @PostMapping("/quizzes/{quizId}/unlock-all")
    public ResponseEntity<?> unlockQuizForAllStudents(@PathVariable Long quizId) {
        getCurrentUserId(); // Verify teacher is authenticated
        
        quizAttemptRepo.unlockQuizForAllStudents(quizId);
        return ResponseEntity.ok(Map.of("message", "Quiz unlocked for all students"));
    }

    // DELETE /quizzes/{quizId}/marks-sheet — teacher deletes all marks for a quiz
    @Transactional
    @DeleteMapping("/quizzes/{quizId}/marks-sheet")
    public ResponseEntity<?> deleteMarksSheet(@PathVariable Long quizId) {
        getCurrentUserId(); // Verify teacher is authenticated
        
        // Delete attempts
        quizAttemptRepo.deleteAllByQuizId(quizId);
        
        // Optionally delete corresponding student answers too
        List<StudentAnswer> answers = answerRepo.findByQuizId(quizId);
        answerRepo.deleteAll(answers);
        
        return ResponseEntity.ok(Map.of(
            "message", "All marks and attempts for this quiz have been deleted"
        ));
    }

    // ─── helpers ─────────────────────────────────────────────────────────────
    private Map<String, Object> buildResult(Map<String, Object> body,
                                             int total, int obtained, int correct, int answered) {
        double pct  = total == 0 ? 0.0 : Math.round(obtained * 100.0 / total * 10.0) / 10.0;
        boolean pass = pct >= 70.0;
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("attempt_id",  body.getOrDefault("attempt_id", 0));
        r.put("score",       obtained);
        r.put("max_score",   total);
        r.put("percentage",  pct);
        r.put("passed",      pass);
        r.put("correct",     correct);
        r.put("total",       answered);
        r.put("feedback",    pass ? "Great job! You passed." : "Keep studying and try again.");
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
