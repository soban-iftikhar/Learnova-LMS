package lms.learnova.Controller;

import lms.learnova.Model.Enrollment;
import lms.learnova.Model.User;
import lms.learnova.Repository.UserRepo;
import lms.learnova.Service.EnrollmentService;
import lms.learnova.Service.StudentService;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * /enrollments — matches frontend API docs exactly.
 *
 * POST   /enrollments            { course_id }  → enroll current student
 * GET    /enrollments/my-courses               → enrolled courses for current user
 * DELETE /enrollments/{id}                     → unenroll
 */
@RestController
@RequestMapping("/enrollments")
public class EnrollmentsApiController {

    private final EnrollmentService enrollmentService;
    private final StudentService studentService;
    private final UserRepo userRepo;

    public EnrollmentsApiController(EnrollmentService enrollmentService,
                                    StudentService studentService,
                                    UserRepo userRepo) {
        this.enrollmentService = enrollmentService;
        this.studentService = studentService;
        this.userRepo = userRepo;
    }

    // ─── POST /enrollments ────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> enroll(@RequestBody Map<String, Object> body) {
        Long courseId = toLong(body.get("course_id"));
        Long studentId = getCurrentStudentId();

        Enrollment enrollment = enrollmentService.enrollStudent(studentId, courseId);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id",              enrollment.getId(),
                "student_id",      studentId,
                "course_id",       courseId,
                "enrollment_date", enrollment.getEnrollmentDate().toString(),
                "status",          enrollment.getStatus(),
                "progress",        0
        ));
    }

    // ─── GET /enrollments/my-courses ─────────────────────────────────────────
    @GetMapping("/my-courses")
    public ResponseEntity<?> getMyCourses(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
    ) {
        Long studentId = getCurrentStudentId();
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStudent(studentId);

        List<Map<String, Object>> content = enrollments.stream()
                .filter(e -> status == null || status.isEmpty() || status.equalsIgnoreCase(e.getStatus()))
                .map(e -> Map.<String, Object>of(
                        "id",              e.getId(),
                        "course", Map.of(
                                "id",         e.getCourse().getId(),
                                "title",      e.getCourse().getTitle(),
                                "instructor", e.getCourse().getInstructor() != null
                                        ? e.getCourse().getInstructor().getName() : "Unknown",
                                "image_url",  "",
                                "category",   e.getCourse().getCategory() != null
                                        ? Map.of("id", 0, "name", e.getCourse().getCategory())
                                        : Map.of("id", 0, "name", "General")
                        ),
                        "progress",        0,
                        "status",          e.getStatus(),
                        "enrollment_date", e.getEnrollmentDate().toString()
                ))
                .collect(Collectors.toList());

        int total = content.size();
        return ResponseEntity.ok(Map.of(
                "content", content,
                "pagination", Map.of(
                        "page", page,
                        "size", size,
                        "total_elements", total,
                        "total_pages", (int) Math.ceil((double) total / size)
                )
        ));
    }

    // ─── DELETE /enrollments/{enrollmentId} ───────────────────────────────────
    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<Void> unenroll(@PathVariable Long enrollmentId) {
        Long studentId = getCurrentStudentId();
        // Find the enrollment and soft-delete it
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStudent(studentId);
        enrollments.stream()
                .filter(e -> e.getId().equals(enrollmentId))
                .findFirst()
                .ifPresent(e -> enrollmentService.unrollStudent(studentId, e.getCourse().getId()));
        return ResponseEntity.noContent().build();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Long getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        String email = auth.getName();
        User user = userRepo.findByEmail(email);
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }

    private Long toLong(Object val) {
        if (val == null) throw new IllegalArgumentException("course_id is required");
        if (val instanceof Integer) return ((Integer) val).longValue();
        if (val instanceof Long) return (Long) val;
        return Long.parseLong(val.toString());
    }
}
