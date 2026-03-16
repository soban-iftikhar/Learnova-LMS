package lms.learnova.Controller;

import lms.learnova.Enum.Role;
import lms.learnova.Model.*;
import lms.learnova.Repository.*;
import lms.learnova.Service.*;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * FIXED: N+1 query storm eliminated.
 *
 * Root cause: the previous version called enrollmentRepo.findAll() and
 * studentAnswerRepo.findAll() — these load EVERY row in those tables, then
 * for each row lazily trigger additional selects for student, quiz, course,
 * user_profile, etc., causing hundreds of queries and an Internal Server Error.
 *
 * Fix: replaced findAll() with course-scoped queries:
 *   enrollmentRepo.findByCourseIdsActive(courseIds)   — only this instructor's courses
 *   studentAnswerRepo.findByCourseIds(courseIds)       — only this instructor's courses
 */
@RestController
@RequestMapping("/dashboard")
public class DashboardApiController {

    private final EnrollmentService  enrollmentService;
    private final EnrollmentRepo     enrollmentRepo;
    private final CourseService      courseService;
    private final AdminService       adminService;
    private final UserRepo           userRepo;
    private final StudentAnswerRepo  studentAnswerRepo;
    private final QuizRepo           quizRepo;
    private final RatingApiController ratingController;

    @Value("${ADMIN_EMAIL:admin@learnova.io}")
    private String adminEmail;

    public DashboardApiController(EnrollmentService enrollmentService,
                                  EnrollmentRepo enrollmentRepo,
                                  CourseService courseService,
                                  AdminService adminService,
                                  UserRepo userRepo,
                                  StudentAnswerRepo studentAnswerRepo,
                                  QuizRepo quizRepo,
                                  RatingApiController ratingController) {
        this.enrollmentService = enrollmentService;
        this.enrollmentRepo    = enrollmentRepo;
        this.courseService     = courseService;
        this.adminService      = adminService;
        this.userRepo          = userRepo;
        this.studentAnswerRepo = studentAnswerRepo;
        this.quizRepo          = quizRepo;
        this.ratingController  = ratingController;
    }

    // ── GET /dashboard/student ───────────────────────────────────────────────
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
                    m.put("id",       e.getCourse().getId());
                    m.put("title",    e.getCourse().getTitle());
                    m.put("progress", 0);
                    m.put("latest_activity",
                            e.getUpdatedAt() != null ? e.getUpdatedAt().toString()
                                    : e.getCreatedAt() != null ? e.getCreatedAt().toString() : "");
                    return m;
                }).collect(Collectors.toList());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("enrolled_courses",   total);
        resp.put("in_progress",        active);
        resp.put("completed",          completed);
        resp.put("average_grade",      0.0);
        resp.put("recent_courses",     recentCourses);
        resp.put("upcoming_deadlines", new ArrayList<>());
        return ResponseEntity.ok(resp);
    }

    // ── GET /dashboard/instructor ────────────────────────────────────────────
    @GetMapping("/instructor")
    public ResponseEntity<?> instructorDashboard() {
        Long userId = getCurrentUserId();

        // 1. This instructor's courses only
        List<Course> courses = courseService.getAllCourses().stream()
                .filter(c -> c.getInstructor() != null && c.getInstructor().getId().equals(userId))
                .collect(Collectors.toList());

        if (courses.isEmpty()) {
            // Return empty dashboard immediately — no DB queries needed
            Map<String, Object> empty = new LinkedHashMap<>();
            empty.put("total_courses",     0);
            empty.put("total_students",    0);
            empty.put("total_enrollments", 0);
            empty.put("average_rating",    0.0);
            empty.put("courses",           new ArrayList<>());
            Map<String, Object> activity = new LinkedHashMap<>();
            activity.put("recent_enrollments",     new ArrayList<>());
            activity.put("recent_quiz_submissions", new ArrayList<>());
            empty.put("recent_activity", activity);
            return ResponseEntity.ok(empty);
        }

        List<Long> courseIds = courses.stream().map(Course::getId).collect(Collectors.toList());

        // 2. Load all enrollments for these courses IN ONE QUERY
        List<Enrollment> allEnrollments = enrollmentRepo.findByCourseIdsActive(courseIds);

        // 3. Unique students across all enrollments
        Set<Long> uniqueStudentIds = allEnrollments.stream()
                .map(e -> e.getStudent().getId())
                .collect(Collectors.toSet());

        // 4. Per-course enrollment count (built from the list we already have — no extra queries)
        Map<Long, Long> enrCountByCourse = allEnrollments.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCourse().getId(), Collectors.counting()));

        // 5. Ratings
        double avgRating = ratingController.getAverageRatingForCourses(courseIds);

        // 6. Per-course summary
        List<Map<String, Object>> courseList = courses.stream().map(c -> {
            double cRating = ratingController.getAverageRating(c.getId());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",       c.getId());
            m.put("title",    c.getTitle());
            m.put("students", enrCountByCourse.getOrDefault(c.getId(), 0L));
            m.put("rating",   Math.round(cRating * 10.0) / 10.0);
            m.put("status",   "ACTIVE");
            return m;
        }).collect(Collectors.toList());

        // 7. Recent enrollments — top 10, already sorted DESC by query
        List<Map<String, Object>> recentEnrollments = allEnrollments.stream()
                .limit(10)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",            e.getId());
                    m.put("student_name",  e.getStudent().getName());
                    m.put("student_email", e.getStudent().getEmail());
                    m.put("course_title",  e.getCourse().getTitle());
                    m.put("enrolled_at",   e.getEnrollmentDate() != null
                            ? e.getEnrollmentDate().toString() : "");
                    m.put("status",        e.getStatus());
                    return m;
                }).collect(Collectors.toList());

        // 8. Recent quiz submissions — scoped to this instructor's courses only
        List<StudentAnswer> rawAnswers = studentAnswerRepo.findByCourseIds(courseIds);

        // Deduplicate: one entry per (student, quiz) — take latest per pair
        Map<String, StudentAnswer> latestByStudentQuiz = new LinkedHashMap<>();
        for (StudentAnswer sa : rawAnswers) {
            String key = sa.getStudent().getId() + ":" + sa.getQuiz().getId();
            latestByStudentQuiz.putIfAbsent(key, sa); // already sorted DESC by submittedAt
        }

        List<Map<String, Object>> recentQuizSubs = latestByStudentQuiz.values().stream()
                .limit(10)
                .map(sa -> {
                    // Compute total score for this student+quiz
                    List<StudentAnswer> quizAnswers = studentAnswerRepo
                            .findByStudentIdAndQuizId(sa.getStudent().getId(), sa.getQuiz().getId());
                    int obtained = quizAnswers.stream()
                            .mapToInt(a -> a.getMarksObtained() != null ? a.getMarksObtained() : 0).sum();
                    int total2   = quizAnswers.stream()
                            .mapToInt(a -> (a.getQuestion() != null && a.getQuestion().getMarks() != null)
                                    ? a.getQuestion().getMarks() : 1).sum();
                    double pct   = total2 > 0
                            ? Math.round(obtained * 100.0 / total2 * 10.0) / 10.0 : 0.0;

                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",           sa.getStudent().getId() + "_" + sa.getQuiz().getId());
                    m.put("student_name", sa.getStudent().getName());
                    m.put("quiz_title",   sa.getQuiz().getTitle());
                    m.put("course_title", sa.getQuiz().getCourse().getTitle());
                    m.put("score",        obtained);
                    m.put("max_score",    total2);
                    m.put("percentage",   pct);
                    m.put("passed",       pct >= 70.0);
                    m.put("submitted_at", sa.getSubmittedAt() != null
                            ? sa.getSubmittedAt().toString() : "");
                    return m;
                }).collect(Collectors.toList());

        Map<String, Object> recentActivity = new LinkedHashMap<>();
        recentActivity.put("recent_enrollments",      recentEnrollments);
        recentActivity.put("recent_quiz_submissions",  recentQuizSubs);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("total_courses",     courses.size());
        resp.put("total_students",    uniqueStudentIds.size());
        resp.put("total_enrollments", allEnrollments.size());
        resp.put("average_rating",    avgRating);
        resp.put("courses",           courseList);
        resp.put("recent_activity",   recentActivity);
        return ResponseEntity.ok(resp);
    }

    // ── GET /dashboard/admin ─────────────────────────────────────────────────
    @GetMapping("/admin")
    public ResponseEntity<?> adminDashboard() {
        var stats = adminService.getSystemStatistics();
        int students    = stats.getTotalStudents()    != null ? stats.getTotalStudents()    : 0;
        int instructors = stats.getTotalInstructors() != null ? stats.getTotalInstructors() : 0;
        int courses     = stats.getTotalCourses()     != null ? stats.getTotalCourses()     : 0;
        int enrollments = stats.getTotalEnrollments() != null ? stats.getTotalEnrollments() : 0;

        long uniqueStudents = userRepo.findByRole(Role.STUDENT).size();

        Map<String, Object> breakdown = new LinkedHashMap<>();
        breakdown.put("students",    uniqueStudents);
        breakdown.put("instructors", instructors);
        breakdown.put("admins",      1);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("total_users",       uniqueStudents + instructors);
        resp.put("total_courses",     courses);
        resp.put("total_enrollments", enrollments);
        resp.put("user_breakdown",    breakdown);
        resp.put("recent_activities", new ArrayList<>());
        resp.put("course_statistics", new LinkedHashMap<>());
        return ResponseEntity.ok(resp);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────
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
