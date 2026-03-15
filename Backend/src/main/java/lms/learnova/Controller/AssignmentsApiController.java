package lms.learnova.Controller;

import lms.learnova.Model.*;
import lms.learnova.Repository.CourseContentRepo;
import lms.learnova.Repository.CourseRepo;
import lms.learnova.Repository.UserRepo;
import lms.learnova.Service.CourseContentService;
import lms.learnova.exception.ResourceNotFoundException;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class AssignmentsApiController {

    private final CourseContentService contentService;
    private final CourseContentRepo    contentRepo;
    private final CourseRepo           courseRepo;
    private final UserRepo             userRepo;

    public AssignmentsApiController(CourseContentService contentService,
                                    CourseContentRepo contentRepo,
                                    CourseRepo courseRepo,
                                    UserRepo userRepo) {
        this.contentService = contentService;
        this.contentRepo    = contentRepo;
        this.courseRepo     = courseRepo;
        this.userRepo       = userRepo;
    }

    // GET /courses/{courseId}/assignments
    @GetMapping("/courses/{courseId}/assignments")
    public ResponseEntity<?> getCourseAssignments(@PathVariable Long courseId) {
        List<Map<String, Object>> assignments = contentService.getCourseMaterialsAsDTO(courseId)
                .stream()
                .filter(m -> Boolean.TRUE.equals(m.getIsAssignment()))
                .map(m -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id",           m.getId());
                    item.put("title",        m.getTitle()       != null ? m.getTitle()       : "Assignment");
                    item.put("description",  m.getDescription() != null ? m.getDescription() : "");
                    item.put("due_date",     m.getDueDate()     != null ? m.getDueDate().toString() : "");
                    item.put("total_points", 100);
                    item.put("order",        m.getOrderIndex()  != null ? m.getOrderIndex()  : 0);
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content", assignments);
        return ResponseEntity.ok(resp);
    }

    // POST /courses/{courseId}/assignments
    @PostMapping("/courses/{courseId}/assignments")
    public ResponseEntity<?> createAssignment(@PathVariable Long courseId,
                                              @RequestBody Map<String, Object> body) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        PDF pdf = new PDF();
        pdf.setCourse(course);
        pdf.setTitle(str(body, "title", "Assignment"));
        pdf.setDescription(str(body, "description", ""));
        pdf.setIsAssignment(true);
        pdf.setIsPublished(true);
        pdf.setFilePath("");
        pdf.setOrderIndex(0);
        pdf.setUploadedAt(LocalDateTime.now());

        String dueDateStr = str(body, "due_date", "");
        if (!dueDateStr.isBlank()) {
            try {
                pdf.setDueDate(LocalDateTime.parse(
                        dueDateStr.length() == 16 ? dueDateStr + ":00" : dueDateStr));
            } catch (Exception ignored) {}
        }

        contentRepo.save(pdf);

        int totalPoints = toInt(body.get("total_points"), 100);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id",           pdf.getId());
        resp.put("title",        pdf.getTitle());
        resp.put("description",  pdf.getDescription() != null ? pdf.getDescription() : "");
        resp.put("due_date",     pdf.getDueDate() != null ? pdf.getDueDate().toString() : "");
        resp.put("total_points", totalPoints);
        resp.put("status",       "ACTIVE");
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    // POST /assignments/{assignmentId}/submit  (multipart)
    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestParam(value = "file",            required = false) MultipartFile file,
            @RequestParam(value = "submission_text", required = false) String submissionText) {

        Long studentId = getCurrentUserId();
        String fileUrl = (file != null && !file.isEmpty()) ? "/uploads/" + file.getOriginalFilename() : "";

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id",              System.currentTimeMillis());
        resp.put("assignment_id",   assignmentId);
        resp.put("student_id",      studentId);
        resp.put("submission_date", Instant.now().toString());
        resp.put("status",          "SUBMITTED");
        resp.put("file_url",        fileUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    // PUT /assignments/{assignmentId}/submissions/{submissionId}/grade
    @PutMapping("/assignments/{assignmentId}/submissions/{submissionId}/grade")
    public ResponseEntity<?> gradeSubmission(@PathVariable Long assignmentId,
                                             @PathVariable Long submissionId,
                                             @RequestBody Map<String, Object> body) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id",            submissionId);
        resp.put("assignment_id", assignmentId);
        resp.put("points_earned", body.getOrDefault("points_earned", 0));
        resp.put("feedback",      body.getOrDefault("feedback",      ""));
        resp.put("status",        body.getOrDefault("status",        "GRADED"));
        resp.put("graded_date",   Instant.now().toString());
        return ResponseEntity.ok(resp);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }

    private String str(Map<String, Object> m, String key, String def) {
        Object v = m.get(key);
        return v != null ? v.toString() : def;
    }

    private int toInt(Object val, int def) {
        if (val == null)            return def;
        if (val instanceof Integer) return (Integer) val;
        if (val instanceof Number)  return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return def; }
    }
}
