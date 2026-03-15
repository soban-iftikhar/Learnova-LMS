package lms.learnova.Controller;

import lms.learnova.DTOs.QuizDTO;
import lms.learnova.DTOs.QuizQuestionDTO;
import lms.learnova.Model.*;
import lms.learnova.Repository.CourseRepo;
import lms.learnova.Repository.QuizRepo;
import lms.learnova.Repository.QuizQuestionRepo;
import lms.learnova.Repository.UserRepo;
import lms.learnova.Service.QuizCreationService;
import lms.learnova.exception.ResourceNotFoundException;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Full quiz management for instructors.
 * POST   /courses/{courseId}/quizzes
 * PUT    /quizzes/{quizId}
 * DELETE /quizzes/{quizId}
 * PUT    /quizzes/{quizId}/publish
 * GET    /quizzes/{quizId}/questions
 * POST   /quizzes/{quizId}/questions
 * PUT    /quizzes/{quizId}/questions/{qId}
 * DELETE /quizzes/{quizId}/questions/{qId}
 */
@RestController
public class QuizManagementController {

    private final QuizRepo            quizRepo;
    private final QuizQuestionRepo    questionRepo;
    private final CourseRepo          courseRepo;
    private final UserRepo            userRepo;
    private final QuizCreationService quizCreationService;

    public QuizManagementController(QuizRepo quizRepo,
                                     QuizQuestionRepo questionRepo,
                                     CourseRepo courseRepo,
                                     UserRepo userRepo,
                                     QuizCreationService quizCreationService) {
        this.quizRepo            = quizRepo;
        this.questionRepo        = questionRepo;
        this.courseRepo          = courseRepo;
        this.userRepo            = userRepo;
        this.quizCreationService = quizCreationService;
    }

    // POST /courses/{courseId}/quizzes
    @PostMapping("/courses/{courseId}/quizzes")
    public ResponseEntity<?> createQuiz(@PathVariable Long courseId,
                                         @RequestBody Map<String, Object> body) {
        Long instructorId = getCurrentInstructorId();
        QuizDTO dto = new QuizDTO();
        dto.setTitle(str(body, "title", "New Quiz"));
        dto.setDescription(str(body, "description", ""));
        dto.setMaxScore(toInt(body.get("max_score"), 100));
        dto.setTimeLimitSeconds(toInt(body.get("time_limit"), 30) * 60);
        Quiz quiz = quizCreationService.createQuiz(courseId, instructorId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(quizToMap(quiz));
    }

    // PUT /quizzes/{quizId}
    @PutMapping("/quizzes/{quizId}")
    public ResponseEntity<?> updateQuiz(@PathVariable Long quizId,
                                         @RequestBody Map<String, Object> body) {
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        if (body.containsKey("title"))       quiz.setTitle(str(body, "title", ""));
        if (body.containsKey("description")) quiz.setDescription(str(body, "description", ""));
        if (body.containsKey("max_score"))   quiz.setMaxScore(toInt(body.get("max_score"), 100));
        if (body.containsKey("time_limit"))  quiz.setTimeLimitSeconds(toInt(body.get("time_limit"), 30) * 60);
        quizRepo.save(quiz);
        return ResponseEntity.ok(quizToMap(quiz));
    }

    // DELETE /quizzes/{quizId}
    @DeleteMapping("/quizzes/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long quizId) {
        quizRepo.deleteById(quizId);
        return ResponseEntity.noContent().build();
    }

    // PUT /quizzes/{quizId}/publish
    @PutMapping("/quizzes/{quizId}/publish")
    public ResponseEntity<?> togglePublish(@PathVariable Long quizId,
                                            @RequestBody(required = false) Map<String, Object> body) {
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        boolean published = body != null && body.containsKey("published")
                ? Boolean.TRUE.equals(body.get("published"))
                : !Boolean.TRUE.equals(quiz.getIsPublished());
        quiz.setIsPublished(published);
        quizRepo.save(quiz);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("published", published);
        resp.put("quiz_id",   quizId);
        return ResponseEntity.ok(resp);
    }

    // GET /quizzes/{quizId}/questions
    @GetMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<?> getQuestions(@PathVariable Long quizId) {
        List<Map<String, Object>> result = questionRepo.findByQuizIdOrderByQuestionOrder(quizId)
                .stream().map(this::questionToMap).collect(Collectors.toList());
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content", result);
        return ResponseEntity.ok(resp);
    }

    // POST /quizzes/{quizId}/questions
    @PostMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<?> addQuestion(@PathVariable Long quizId,
                                          @RequestBody Map<String, Object> body) {
        QuizQuestionDTO dto = buildQuestionDTO(body);
        QuizQuestion q = quizCreationService.addQuestionToQuiz(quizId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(questionToMap(q));
    }

    // PUT /quizzes/{quizId}/questions/{questionId}
    @PutMapping("/quizzes/{quizId}/questions/{questionId}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long quizId,
                                             @PathVariable Long questionId,
                                             @RequestBody Map<String, Object> body) {
        QuizQuestionDTO dto = buildQuestionDTO(body);
        QuizQuestion q = quizCreationService.updateQuestion(questionId, dto);
        return ResponseEntity.ok(questionToMap(q));
    }

    // DELETE /quizzes/{quizId}/questions/{questionId}
    @DeleteMapping("/quizzes/{quizId}/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long quizId,
                                                @PathVariable Long questionId) {
        questionRepo.deleteById(questionId);
        return ResponseEntity.noContent().build();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Long getCurrentInstructorId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("Instructor account not found");
        return user.getId();
    }

    private Map<String, Object> quizToMap(Quiz q) {
        long questionCount = 0;
        try { questionCount = questionRepo.countByQuizId(q.getId()); } catch (Exception ignored) {}

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",             q.getId());
        m.put("title",          q.getTitle());
        m.put("description",    q.getDescription() != null ? q.getDescription() : "");
        m.put("max_score",      q.getMaxScore() != null ? q.getMaxScore() : 100);
        m.put("time_limit",     q.getTimeLimitSeconds() != null ? q.getTimeLimitSeconds() / 60 : 30);
        m.put("question_count", questionCount);
        m.put("is_published",   Boolean.TRUE.equals(q.getIsPublished()));
        m.put("status",         Boolean.TRUE.equals(q.getIsPublished()) ? "ACTIVE" : "DRAFT");
        m.put("created_at",     q.getCreatedAt() != null ? q.getCreatedAt().toString() : "");
        return m;
    }

    private Map<String, Object> questionToMap(QuizQuestion q) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",             q.getId());
        m.put("question_text",  q.getQuestionText());
        m.put("option_a",       q.getOptionA());
        m.put("option_b",       q.getOptionB());
        m.put("option_c",       q.getOptionC());
        m.put("option_d",       q.getOptionD());
        m.put("correct_answer", q.getCorrectAnswer());
        m.put("marks",          q.getMarks() != null ? q.getMarks() : 1);
        m.put("order",          q.getQuestionOrder() != null ? q.getQuestionOrder() : 0);
        return m;
    }

    private QuizQuestionDTO buildQuestionDTO(Map<String, Object> body) {
        QuizQuestionDTO dto = new QuizQuestionDTO();
        dto.setQuestionText(str(body, "question_text", ""));
        dto.setOptionA(str(body, "option_a", ""));
        dto.setOptionB(str(body, "option_b", ""));
        dto.setOptionC(str(body, "option_c", ""));
        dto.setOptionD(str(body, "option_d", ""));
        dto.setCorrectAnswer(str(body, "correct_answer", "A"));
        dto.setMarks(toInt(body.get("marks"), 1));
        return dto;
    }

    private String str(Map<String, Object> m, String key, String def) {
        Object v = m.get(key);
        return v != null ? v.toString() : def;
    }

    private Integer toInt(Object val, int def) {
        if (val == null)            return def;
        if (val instanceof Integer) return (Integer) val;
        if (val instanceof Number)  return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return def; }
    }
}
