package lms.learnova.Controller;

import lms.learnova.Model.User;
import lms.learnova.Repository.CourseRepo;
import lms.learnova.Repository.EnrollmentRepo;
import lms.learnova.Repository.UserRepo;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Assignment submissions visible to both student and teacher.
 *
 * POST /assignments/{assignmentId}/submit          — student submits
 * GET  /assignments/{assignmentId}/submissions     — teacher sees all submissions for an assignment
 * GET  /courses/{courseId}/submissions             — teacher sees all submissions across a course
 * PUT  /assignments/{assignmentId}/submissions/{id}/grade — teacher grades a submission
 */
@RestController
public class SubmissionsApiController {

    // In-memory store keyed by submission ID
    // Persisting to DB requires a Submission JPA entity — this can be migrated later.
    private final ConcurrentHashMap<Long, Map<String, Object>> submissionsStore = new ConcurrentHashMap<>();
    private final AtomicLong idSeq = new AtomicLong(1);

    private final UserRepo       userRepo;
    private final CourseRepo     courseRepo;
    private final EnrollmentRepo enrollmentRepo;

    public SubmissionsApiController(UserRepo userRepo,
                                    CourseRepo courseRepo,
                                    EnrollmentRepo enrollmentRepo) {
        this.userRepo       = userRepo;
        this.courseRepo     = courseRepo;
        this.enrollmentRepo = enrollmentRepo;
    }

    // POST /assignments/{assignmentId}/submit  (multipart)
    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submit(
            @PathVariable Long assignmentId,
            @RequestParam(value = "file",            required = false) MultipartFile file,
            @RequestParam(value = "submission_text", required = false) String text) {

        Long studentId = getCurrentUserId();
        String studentName = getUserName(studentId);

        String fileUrl  = "";
        String fileName = "";
        if (file != null && !file.isEmpty()) {
            fileUrl  = "/uploads/" + file.getOriginalFilename();
            fileName = file.getOriginalFilename();
        }

        long id = idSeq.getAndIncrement();
        Map<String, Object> sub = new LinkedHashMap<>();
        sub.put("id",              id);
        sub.put("assignment_id",   assignmentId);
        sub.put("student_id",      studentId);
        sub.put("student_name",    studentName);
        sub.put("submission_date", Instant.now().toString());
        sub.put("status",          "SUBMITTED");
        sub.put("file_url",        fileUrl);
        sub.put("file_name",       fileName);
        sub.put("submission_text", text != null ? text : "");
        sub.put("grade",           null);
        sub.put("feedback",        null);
        submissionsStore.put(id, sub);

        return ResponseEntity.status(HttpStatus.CREATED).body(sub);
    }

    // GET /assignments/{assignmentId}/submissions  — teacher view
    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<?> getSubmissions(@PathVariable Long assignmentId) {
        List<Map<String, Object>> list = submissionsStore.values().stream()
                .filter(s -> assignmentId.equals(toLong(s.get("assignment_id"))))
                .sorted(Comparator.comparing(s -> String.valueOf(s.get("submission_date"))))
                .collect(Collectors.toList());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content", list);
        return ResponseEntity.ok(resp);
    }

    // GET /courses/{courseId}/submissions  — all submissions for teacher's course
    @GetMapping("/courses/{courseId}/submissions")
    public ResponseEntity<?> getCourseSubmissions(@PathVariable Long courseId) {
        // We don't have assignment→course mapping in the store yet,
        // so return all submissions (teacher will filter by course on their side).
        // In production this would join with assignment.course_id.
        List<Map<String, Object>> list = new ArrayList<>(submissionsStore.values());
        list.sort(Comparator.comparing(s -> String.valueOf(s.get("submission_date"))));

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content", list);
        return ResponseEntity.ok(resp);
    }

    // GET /submissions/my  — student sees their own submissions
    @GetMapping("/submissions/my")
    public ResponseEntity<?> mySubmissions() {
        Long studentId = getCurrentUserId();
        List<Map<String, Object>> list = submissionsStore.values().stream()
                .filter(s -> studentId.equals(toLong(s.get("student_id"))))
                .sorted(Comparator.comparing(s -> String.valueOf(s.get("submission_date"))))
                .collect(Collectors.toList());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content", list);
        return ResponseEntity.ok(resp);
    }

    // PUT /assignments/{assignmentId}/submissions/{submissionId}/grade
    @PutMapping("/assignments/{assignmentId}/submissions/{submissionId}/grade")
    public ResponseEntity<?> grade(@PathVariable Long assignmentId,
                                    @PathVariable Long submissionId,
                                    @RequestBody Map<String, Object> body) {
        Map<String, Object> sub = submissionsStore.get(submissionId);
        if (sub == null) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("error", "Submission not found");
            return ResponseEntity.status(404).body(err);
        }
        sub.put("grade",      body.getOrDefault("points_earned", body.getOrDefault("grade", 0)));
        sub.put("feedback",   body.getOrDefault("feedback", ""));
        sub.put("status",     "GRADED");
        sub.put("graded_at",  Instant.now().toString());
        submissionsStore.put(submissionId, sub);
        return ResponseEntity.ok(sub);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }

    private String getUserName(Long userId) {
        return userRepo.findById(userId).map(User::getName).orElse("Student");
    }

    private Long toLong(Object val) {
        if (val == null)            return null;
        if (val instanceof Integer) return ((Integer) val).longValue();
        if (val instanceof Long)    return (Long) val;
        try { return Long.parseLong(val.toString()); } catch (Exception e) { return null; }
    }
}
