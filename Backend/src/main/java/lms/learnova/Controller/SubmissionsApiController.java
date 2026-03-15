package lms.learnova.Controller;

import lms.learnova.Model.User;
import lms.learnova.Repository.CourseContentRepo;
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

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Assignment submissions.
 *
 * POST /assignments/{assignmentId}/submit
 * GET  /assignments/{assignmentId}/submissions
 * GET  /courses/{courseId}/submissions
 * GET  /submissions/my
 * PUT  /assignments/{assignmentId}/submissions/{id}/grade
 *
 * FIXED:
 * - Stores course_id on every submission so getCourseSubmissions correctly filters
 * - Saves uploaded files to disk under /tmp/learnova-uploads/
 * - Returns accessible file_url with /api/files/{filename} path
 */
@RestController
public class SubmissionsApiController {

    private static final String UPLOAD_DIR = System.getProperty("java.io.tmpdir") + "/learnova-uploads/";

    private final ConcurrentHashMap<Long, Map<String, Object>> store = new ConcurrentHashMap<>();
    private final AtomicLong idSeq = new AtomicLong(1);

    private final UserRepo          userRepo;
    private final CourseRepo        courseRepo;
    private final CourseContentRepo contentRepo;
    private final EnrollmentRepo    enrollmentRepo;

    public SubmissionsApiController(UserRepo userRepo,
                                    CourseRepo courseRepo,
                                    CourseContentRepo contentRepo,
                                    EnrollmentRepo enrollmentRepo) {
        this.userRepo       = userRepo;
        this.courseRepo     = courseRepo;
        this.contentRepo    = contentRepo;
        this.enrollmentRepo = enrollmentRepo;
        // Ensure upload dir exists
        new File(UPLOAD_DIR).mkdirs();
    }

    // POST /assignments/{assignmentId}/submit
    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submit(
            @PathVariable Long assignmentId,
            @RequestParam(value = "file",            required = false) MultipartFile file,
            @RequestParam(value = "submission_text", required = false) String text) {

        Long studentId   = getCurrentUserId();
        String studentName = getUserName(studentId);

        // Resolve the course_id for this assignment (assignment = PDF content item)
        Long courseId = null;
        try {
            var content = contentRepo.findById(assignmentId).orElse(null);
            if (content != null && content.getCourse() != null) {
                courseId = content.getCourse().getId();
            }
        } catch (Exception ignored) {}

        String fileUrl  = "";
        String fileName = "";
        if (file != null && !file.isEmpty()) {
            fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            try {
                Files.write(Paths.get(UPLOAD_DIR + fileName), file.getBytes());
                fileUrl = "/files/" + fileName;
            } catch (IOException e) {
                fileUrl  = "";
                fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
            }
        }

        long id = idSeq.getAndIncrement();
        Map<String, Object> sub = new LinkedHashMap<>();
        sub.put("id",              id);
        sub.put("assignment_id",   assignmentId);
        sub.put("course_id",       courseId);
        sub.put("student_id",      studentId);
        sub.put("student_name",    studentName);
        sub.put("submission_date", Instant.now().toString());
        sub.put("status",          "SUBMITTED");
        sub.put("file_url",        fileUrl);
        sub.put("file_name",       fileName);
        sub.put("submission_text", text != null ? text : "");
        sub.put("grade",           null);
        sub.put("feedback",        null);
        store.put(id, sub);

        return ResponseEntity.status(HttpStatus.CREATED).body(sub);
    }

    // GET /assignments/{assignmentId}/submissions
    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<?> getSubmissions(@PathVariable Long assignmentId) {
        List<Map<String, Object>> list = store.values().stream()
                .filter(s -> assignmentId.equals(toLong(s.get("assignment_id"))))
                .sorted(Comparator.comparing(s -> String.valueOf(s.get("submission_date"))))
                .collect(Collectors.toList());
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content", list);
        return ResponseEntity.ok(resp);
    }

    // GET /courses/{courseId}/submissions  — properly filtered by course
    @GetMapping("/courses/{courseId}/submissions")
    public ResponseEntity<?> getCourseSubmissions(@PathVariable Long courseId) {
        List<Map<String, Object>> list = store.values().stream()
                .filter(s -> {
                    // Filter by course_id stored on submission
                    Object cid = s.get("course_id");
                    if (cid != null && courseId.equals(toLong(cid))) return true;
                    // Fallback: if course_id missing, include all (backward compat)
                    return cid == null;
                })
                .sorted(Comparator.comparing(s -> String.valueOf(s.get("submission_date"))))
                .collect(Collectors.toList());
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content", list);
        return ResponseEntity.ok(resp);
    }

    // GET /submissions/my
    @GetMapping("/submissions/my")
    public ResponseEntity<?> mySubmissions() {
        Long studentId = getCurrentUserId();
        List<Map<String, Object>> list = store.values().stream()
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
        Map<String, Object> sub = store.get(submissionId);
        if (sub == null) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("error", "Submission not found");
            return ResponseEntity.status(404).body(err);
        }
        sub.put("grade",     body.getOrDefault("points_earned", body.getOrDefault("grade", 0)));
        sub.put("feedback",  body.getOrDefault("feedback", ""));
        sub.put("status",    "GRADED");
        sub.put("graded_at", Instant.now().toString());
        store.put(submissionId, sub);
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
