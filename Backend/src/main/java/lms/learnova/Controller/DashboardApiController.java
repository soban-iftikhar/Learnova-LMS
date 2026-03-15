package lms.learnova.Controller;

import lms.learnova.Model.Enrollment;
import lms.learnova.Model.User;
import lms.learnova.Repository.EnrollmentRepo;
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

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard")
public class DashboardApiController {

    private final EnrollmentService enrollmentService;
    private final EnrollmentRepo    enrollmentRepo;
    private final CourseService     courseService;
    private final AdminService      adminService;
    private final UserRepo          userRepo;

    @Value("${ADMIN_EMAIL:admin@learnova.io}")
    private String adminEmail;

    public DashboardApiController(EnrollmentService enrollmentService,
                                  EnrollmentRepo enrollmentRepo,
                                  CourseService courseService,
                                  AdminService adminService,
                                  UserRepo userRepo) {
        this.enrollmentService = enrollmentService;
        this.enrollmentRepo    = enrollmentRepo;
        this.courseService     = courseService;
        this.adminService      = adminService;
        this.userRepo          = userRepo;
    }

    // GET /dashboard/student
    @GetMapping("/student")
    public ResponseEntity<?> studentDashboard() {
        Long userId = getCurrentUserId();
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStudent(userId);

        long total     = enrollments.stream().filter(e -> !"DROPPED".equalsIgnoreCase(e.getStatus())).count();
        long completed = enrollments.stream().filter(e -> "COMPLETED".equalsIgnoreCase(e.getStatus())).count();
        long active    = enrollments.stream().filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus())).count();

        List<Map<String, Object>> recentCourses = enrollments.stream()
                .filter(e -> !"DROPPED".equalsIgnoreCase(e.getStatus()))
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",              e.getCourse().getId());
                    m.put("title",           e.getCourse().getTitle());
                    m.put("progress",        0);
                    m.put("latest_activity", e.getUpdatedAt() != null
                            ? e.getUpdatedAt().toString()
                            : e.getCreatedAt() != null ? e.getCreatedAt().toString() : "");
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("enrolled_courses",   total);
        resp.put("in_progress",        active);
        resp.put("completed",          completed);
        resp.put("average_grade",      0.0);
        resp.put("recent_courses",     recentCourses);
        resp.put("upcoming_deadlines", new ArrayList<>());
        return ResponseEntity.ok(resp);
    }

    // GET /dashboard/instructor
    @GetMapping("/instructor")
    public ResponseEntity<?> instructorDashboard() {
        Long userId = getCurrentUserId();

        var courses = courseService.getAllCourses().stream()
                .filter(c -> c.getInstructor() != null && c.getInstructor().getId().equals(userId))
                .collect(Collectors.toList());

        long totalStudents = courses.stream()
                .mapToLong(c -> enrollmentRepo.findByCourseId(c.getId()).stream()
                        .filter(e -> !"DROPPED".equalsIgnoreCase(e.getStatus())).count())
                .sum();

        List<Map<String, Object>> courseList = courses.stream()
                .map(c -> {
                    long studentCount = enrollmentRepo.findByCourseId(c.getId()).stream()
                            .filter(e -> !"DROPPED".equalsIgnoreCase(e.getStatus())).count();
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",       c.getId());
                    m.put("title",    c.getTitle());
                    m.put("students", studentCount);
                    m.put("rating",   0.0);
                    m.put("status",   "ACTIVE");
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("total_courses",      courses.size());
        resp.put("total_students",     totalStudents);
        resp.put("total_enrollments",  totalStudents);
        resp.put("average_rating",     0.0);
        resp.put("courses",            courseList);
        resp.put("recent_submissions", new ArrayList<>());
        return ResponseEntity.ok(resp);
    }

    // GET /dashboard/admin
    @GetMapping("/admin")
    public ResponseEntity<?> adminDashboard() {
        var stats = adminService.getSystemStatistics();
        int students    = stats.getTotalStudents()    != null ? stats.getTotalStudents()    : 0;
        int instructors = stats.getTotalInstructors() != null ? stats.getTotalInstructors() : 0;
        int courses     = stats.getTotalCourses()     != null ? stats.getTotalCourses()     : 0;
        int enrollments = stats.getTotalEnrollments() != null ? stats.getTotalEnrollments() : 0;

        Map<String, Object> breakdown = new LinkedHashMap<>();
        breakdown.put("students",    students);
        breakdown.put("instructors", instructors);
        breakdown.put("admins",      1);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("total_users",        students + instructors);
        resp.put("total_courses",      courses);
        resp.put("total_enrollments",  enrollments);
        resp.put("user_breakdown",     breakdown);
        resp.put("recent_activities",  new ArrayList<>());
        resp.put("course_statistics",  new LinkedHashMap<>());
        return ResponseEntity.ok(resp);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        String email = auth.getName();
        if (adminEmail.equalsIgnoreCase(email)) return -1L;
        User user = userRepo.findByEmail(email);
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }
}
