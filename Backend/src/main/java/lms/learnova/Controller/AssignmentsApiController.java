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

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Assignment CRUD only.
 *
 * GET  /courses/{courseId}/assignments    — list assignments for a course
 * POST /courses/{courseId}/assignments    — teacher creates an assignment
 *
 * NOTE: submission endpoints (POST /assignments/{id}/submit,
 *       GET  /assignments/{id}/submissions,
 *       PUT  /assignments/{id}/submissions/{id}/grade)
 *       live exclusively in SubmissionsApiController to avoid duplicate mapping.
 */
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

    // POST /courses/{courseId}/assignments  — teacher creates assignment
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

    // ─── Helpers ─────────────────────────────────────────────────────────────
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
