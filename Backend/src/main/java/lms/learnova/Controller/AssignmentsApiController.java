package lms.learnova.Controller;

import lms.learnova.Model.User;
import lms.learnova.Repository.UserRepo;
import lms.learnova.Service.CourseContentService;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Assignments API — aligned with frontend docs.
 *
 * GET  /courses/{courseId}/assignments       — list assignments for a course
 * POST /assignments/{assignmentId}/submit    — submit (multipart)
 * PUT  /assignments/{id}/submissions/{sid}/grade — grade a submission (INSTRUCTOR)
 */
@RestController
public class AssignmentsApiController {

    private final CourseContentService contentService;
    private final UserRepo userRepo;

    public AssignmentsApiController(CourseContentService contentService, UserRepo userRepo) {
        this.contentService = contentService;
        this.userRepo = userRepo;
    }

    // GET /courses/{courseId}/assignments
    @GetMapping("/courses/{courseId}/assignments")
    public ResponseEntity<?> getCourseAssignments(@PathVariable Long courseId) {
        // Derive assignments from PDFs that are marked as assignments
        List<Map<String, Object>> assignments = contentService.getCourseMaterialsAsDTO(courseId)
                .stream()
                .filter(m -> Boolean.TRUE.equals(m.getIsAssignment()))
                .map(m -> Map.<String, Object>of(
                        "id",           m.getId(),
                        "title",        m.getTitle() != null ? m.getTitle() : "Assignment",
                        "description",  m.getDescription() != null ? m.getDescription() : "",
                        "due_date",     m.getDueDate() != null ? m.getDueDate().toString() : "",
                        "total_points", 100,
                        "order",        m.getOrderIndex() != null ? m.getOrderIndex() : 0
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("content", assignments));
    }

    // POST /assignments/{assignmentId}/submit  (multipart)
    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "submission_text", required = false) String submissionText) {

        Long studentId = getCurrentUserId();
        String fileUrl = "";

        if (file != null && !file.isEmpty()) {
            // In production: save to storage, return URL
            // For now we store the original filename as a placeholder
            fileUrl = "/uploads/" + file.getOriginalFilename();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id",               System.currentTimeMillis(),
                "assignment_id",    assignmentId,
                "student_id",       studentId,
                "submission_date",  Instant.now().toString(),
                "status",           "SUBMITTED",
                "file_url",         fileUrl
        ));
    }

    // PUT /assignments/{assignmentId}/submissions/{submissionId}/grade  (INSTRUCTOR)
    @PutMapping("/assignments/{assignmentId}/submissions/{submissionId}/grade")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long assignmentId,
            @PathVariable Long submissionId,
            @RequestBody Map<String, Object> body) {

        return ResponseEntity.ok(Map.of(
                "id",             submissionId,
                "assignment_id",  assignmentId,
                "points_earned",  body.getOrDefault("points_earned", 0),
                "feedback",       body.getOrDefault("feedback", ""),
                "status",         body.getOrDefault("status", "GRADED"),
                "graded_date",    Instant.now().toString()
        ));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }
}
