package lms.learnova.Controller;

import lms.learnova.Model.Course;
import lms.learnova.Model.PDF;
import lms.learnova.Model.User;
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
                .map(m -> Map.<String, Object>of(
                        "id",           m.getId(),
                        "title",        m.getTitle()       != null ? m.getTitle()       : "Assignment",
                        "description",  m.getDescription() != null ? m.getDescription() : "",
                        "due_date",     m.getDueDate()     != null ? m.getDueDate().toString() : "",
                        "total_points", 100,
                        "order",        m.getOrderIndex()  != null ? m.getOrderIndex()  : 0
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("content", assignments));
    }

    /**
     * POST /courses/{courseId}/assignments  — INSTRUCTOR creates an assignment.
     *
     * Stores it as a PDF CourseContent with isAssignment=true so it appears
     * in student assignment lists automatically.
     */
    @PostMapping("/courses/{courseId}/assignments")
    public ResponseEntity<?> createAssignment(@PathVariable Long courseId,
                                              @RequestBody Map<String, Object> body) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        PDF pdf = new PDF();
        pdf.setCourse(course);
        pdf.setTitle(String.valueOf(body.getOrDefault("title", "Assignment")));
        pdf.setDescription(String.valueOf(body.getOrDefault("description", "")));
        pdf.setIsAssignment(true);
        pdf.setIsPublished(true);
        pdf.setFilePath("");
        pdf.setOrderIndex(0);
        pdf.setUploadedAt(LocalDateTime.now());

        String dueDateStr = (String) body.get("due_date");
        if (dueDateStr != null && !dueDateStr.isBlank()) {
            try {
                pdf.setDueDate(LocalDateTime.parse(dueDateStr.replace("T", "T").length() == 16
                        ? dueDateStr + ":00" : dueDateStr));
            } catch (Exception ignored) {}
        }

        contentRepo.save(pdf);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id",           pdf.getId(),
                "title",        pdf.getTitle(),
                "description",  pdf.getDescription() != null ? pdf.getDescription() : "",
                "due_date",     pdf.getDueDate() != null ? pdf.getDueDate().toString() : "",
                "total_points", body.getOrDefault("total_points", 100),
                "status",       "ACTIVE"
        ));
    }

    // POST /assignments/{assignmentId}/submit  (multipart)
    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestParam(value = "file",            required = false) MultipartFile file,
            @RequestParam(value = "submission_text", required = false) String submissionText) {

        Long studentId = getCurrentUserId();
        String fileUrl = (file != null && !file.isEmpty()) ? "/uploads/" + file.getOriginalFilename() : "";

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
    public ResponseEntity<?> gradeSubmission(@PathVariable Long assignmentId,
                                             @PathVariable Long submissionId,
                                             @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "id",            submissionId,
                "assignment_id", assignmentId,
                "points_earned", body.getOrDefault("points_earned", 0),
                "feedback",      body.getOrDefault("feedback", ""),
                "status",        body.getOrDefault("status", "GRADED"),
                "graded_date",   Instant.now().toString()
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
