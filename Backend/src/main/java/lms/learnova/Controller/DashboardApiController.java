package lms.learnova.Controller;

import lms.learnova.Model.Enrollment;
import lms.learnova.Model.User;
import lms.learnova.Repository.UserRepo;
import lms.learnova.Service.AdminService;
import lms.learnova.Service.CourseService;
import lms.learnova.Service.EnrollmentService;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard")
public class DashboardApiController {

    private final EnrollmentService enrollmentService;
    private final CourseService     courseService;
    private final AdminService      adminService;
    private final UserRepo          userRepo;

    @Value("${ADMIN_EMAIL:admin@learnova.io}")
    private String adminEmail;

    public DashboardApiController(EnrollmentService enrollmentService,
                                  CourseService courseService,
                                  AdminService adminService,
                                  UserRepo userRepo) {
        this.enrollmentService = enrollmentService;
        this.courseService     = courseService;
        this.adminService      = adminService;
        this.userRepo          = userRepo;
    }

    // ─── GET /dashboard/student ───────────────────────────────────────────────
    @GetMapping("/student")
    public ResponseEntity<?> studentDashboard() {
        Long userId = getCurrentUserId();
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStudent(userId);

        long total     = enrollments.size();
        long completed = enrollments.stream().filter(e -> "COMPLETED".equalsIgnoreCase(e.getStatus())).count();
        long active    = enrollments.stream().filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus())).count();

        List<Map<String, Object>> recentCourses = enrollments.stream()
                .limit(5)
                .map(e -> Map.<String, Object>of(
                        "id",              e.getCourse().getId(),
                        "title",           e.getCourse().getTitle(),
                        "progress",        0,
                        "latest_activity", e.getUpdatedAt() != null
                                ? e.getUpdatedAt().toString()
                                : e.getCreatedAt() != null ? e.getCreatedAt().toString() : ""
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "enrolled_courses",   total,
                "in_progress",        active,
                "completed",          completed,
                "average_grade",      0.0,
                "recent_courses",     recentCourses,
                "upcoming_deadlines", List.of()
        ));
    }

    // ─── GET /dashboard/instructor ────────────────────────────────────────────
    @GetMapping("/instructor")
    public ResponseEntity<?> instructorDashboard() {
        Long userId = getCurrentUserId();

        var courses = courseService.getAllCourses().stream()
                .filter(c -> c.getInstructor() != null && c.getInstructor().getId().equals(userId))
                .collect(Collectors.toList());

        long totalStudents = courses.stream().mapToLong(c -> c.getEnrollments().size()).sum();

        List<Map<String, Object>> courseList = courses.stream()
                .map(c -> Map.<String, Object>of(
                        "id",       c.getId(),
                        "title",    c.getTitle(),
                        "students", c.getEnrollments().size(),
                        "rating",   0.0,
                        "status",   "ACTIVE"
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "total_courses",      courses.size(),
                "total_students",     totalStudents,
                "total_enrollments",  totalStudents,
                "average_rating",     0.0,
                "courses",            courseList,
                "recent_submissions", List.of()
        ));
    }

    // ─── GET /dashboard/admin ─────────────────────────────────────────────────
    @GetMapping("/admin")
    public ResponseEntity<?> adminDashboard() {
        var stats = adminService.getSystemStatistics();
        return ResponseEntity.ok(Map.of(
                "total_users",       (stats.getTotalStudents() != null ? stats.getTotalStudents() : 0)
                                   + (stats.getTotalInstructors() != null ? stats.getTotalInstructors() : 0),
                "total_courses",     stats.getTotalCourses() != null ? stats.getTotalCourses() : 0,
                "total_enrollments", stats.getTotalEnrollments() != null ? stats.getTotalEnrollments() : 0,
                "user_breakdown", Map.of(
                        "students",    stats.getTotalStudents()    != null ? stats.getTotalStudents()    : 0,
                        "instructors", stats.getTotalInstructors() != null ? stats.getTotalInstructors() : 0,
                        "admins",      1   // env-based admin
                ),
                "recent_activities", List.of(),
                "course_statistics", Map.of()
        ));
    }

    // ─── Helper: resolve user ID from JWT (skips DB for env admin) ───────────
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");

        String email = auth.getName();
        if (adminEmail.equalsIgnoreCase(email)) {
            // Admin has no DB row — return a synthetic ID
            return -1L;
        }

        User user = userRepo.findByEmail(email);
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }
}
