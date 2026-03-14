package lms.learnova.Controller;

import lms.learnova.Model.Enrollment;
import lms.learnova.Model.User;
import lms.learnova.Repository.UserRepo;
import lms.learnova.Service.CourseService;
import lms.learnova.Service.EnrollmentService;
import lms.learnova.Service.AdminService;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * /dashboard — matches frontend API docs.
 *
 * GET /dashboard/student
 * GET /dashboard/instructor
 * GET /dashboard/admin
 */
@RestController
@RequestMapping("/dashboard")
public class DashboardApiController {

    private final EnrollmentService enrollmentService;
    private final CourseService courseService;
    private final AdminService adminService;
    private final UserRepo userRepo;

    public DashboardApiController(EnrollmentService enrollmentService,
                                  CourseService courseService,
                                  AdminService adminService,
                                  UserRepo userRepo) {
        this.enrollmentService = enrollmentService;
        this.courseService = courseService;
        this.adminService = adminService;
        this.userRepo = userRepo;
    }

    // ─── GET /dashboard/student ───────────────────────────────────────────────
    @GetMapping("/student")
    public ResponseEntity<?> studentDashboard() {
        Long userId = getCurrentUserId();
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStudent(userId);

        long total     = enrollments.size();
        long completed = enrollments.stream().filter(e -> "COMPLETED".equalsIgnoreCase(e.getStatus())).count();
        long active    = enrollments.stream().filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus())).count();

        // Recent courses — last 5 enrollments
        List<Map<String, Object>> recentCourses = enrollments.stream()
                .limit(5)
                .map(e -> Map.<String, Object>of(
                        "id",              e.getCourse().getId(),
                        "title",           e.getCourse().getTitle(),
                        "progress",        0,
                        "latest_activity", e.getUpdatedAt() != null ? e.getUpdatedAt().toString()
                                         : e.getCreatedAt() != null ? e.getCreatedAt().toString() : ""
                ))
                .collect(Collectors.toList());

        // Upcoming deadlines — placeholder (assignments not implemented yet, return empty)
        List<Object> upcomingDeadlines = List.of();

        return ResponseEntity.ok(Map.of(
                "enrolled_courses",    total,
                "in_progress",         active,
                "completed",           completed,
                "average_grade",       0.0,
                "recent_courses",      recentCourses,
                "upcoming_deadlines",  upcomingDeadlines
        ));
    }

    // ─── GET /dashboard/instructor ────────────────────────────────────────────
    @GetMapping("/instructor")
    public ResponseEntity<?> instructorDashboard() {
        Long userId = getCurrentUserId();
        var courses = courseService.getAllCourses().stream()
                .filter(c -> c.getInstructor() != null && c.getInstructor().getId().equals(userId))
                .collect(Collectors.toList());

        long totalStudents = courses.stream()
                .mapToLong(c -> c.getEnrollments().size())
                .sum();

        List<Map<String, Object>> courseList = courses.stream()
                .map(c -> Map.<String, Object>of(
                        "id",      c.getId(),
                        "title",   c.getTitle(),
                        "students", c.getEnrollments().size(),
                        "rating",  4.5,
                        "status",  "ACTIVE"
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "total_courses",      courses.size(),
                "total_students",     totalStudents,
                "total_enrollments",  totalStudents,
                "average_rating",     4.5,
                "courses",            courseList,
                "recent_submissions", List.of()
        ));
    }

    // ─── GET /dashboard/admin ─────────────────────────────────────────────────
    @GetMapping("/admin")
    public ResponseEntity<?> adminDashboard() {
        var stats = adminService.getSystemStatistics();
        return ResponseEntity.ok(Map.of(
                "total_users",       stats.getTotalStudents() + stats.getTotalInstructors(),
                "total_courses",     stats.getTotalCourses(),
                "total_enrollments", stats.getTotalEnrollments(),
                "user_breakdown", Map.of(
                        "students",    stats.getTotalStudents(),
                        "instructors", stats.getTotalInstructors(),
                        "admins",      0
                ),
                "recent_activities",  List.of(),
                "course_statistics",  Map.of()
        ));
    }

    // ─── Helper ───────────────────────────────────────────────────────────────
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }
}
