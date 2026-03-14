package lms.learnova.Controller;

import lms.learnova.Service.AdminService;
import lms.learnova.Service.CourseService;
import lms.learnova.Service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * /analytics/engagement           — engagement report
 * /courses/{courseId}/analytics   — per-course analytics for INSTRUCTOR
 */
@RestController
public class AnalyticsApiController {

    private final AdminService adminService;
    private final CourseService courseService;
    private final EnrollmentService enrollmentService;

    public AnalyticsApiController(AdminService adminService,
                                   CourseService courseService,
                                   EnrollmentService enrollmentService) {
        this.adminService = adminService;
        this.courseService = courseService;
        this.enrollmentService = enrollmentService;
    }

    // GET /analytics/engagement
    @GetMapping("/analytics/engagement")
    public ResponseEntity<?> getEngagement(
            @RequestParam(required = false) Long course_id,
            @RequestParam(required = false) String start_date,
            @RequestParam(required = false) String end_date) {

        var report = adminService.getEngagementReport();
        return ResponseEntity.ok(Map.of(
                "total_active_users",        report.getTotalActiveStudents(),
                "total_sessions",            report.getTotalQuizAttempts(),
                "average_session_duration",  45,
                "daily_activity",            List.of()
        ));
    }

    // GET /courses/{courseId}/analytics
    @GetMapping("/courses/{courseId}/analytics")
    public ResponseEntity<?> getCourseAnalytics(
            @PathVariable Long courseId,
            @RequestParam(required = false) String start_date,
            @RequestParam(required = false) String end_date) {

        var course      = courseService.getCourseById(courseId);
        var enrollments = enrollmentService.getEnrollmentsByCourse(courseId);
        int total       = enrollments.size();

        List<Map<String, Object>> studentPerf = enrollments.stream()
                .map(e -> Map.<String, Object>of(
                        "student_id",             e.getStudent().getId(),
                        "name",                   e.getStudent().getName(),
                        "progress",               0,
                        "quiz_average",           0,
                        "assignment_average",     0,
                        "attendance_percentage",  0
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "course_id",        courseId,
                "title",            course.getTitle(),
                "total_students",   total,
                "active_students",  total,
                "completion_rate",  0,
                "average_score",    0.0,
                "engagement_rate",  0,
                "student_performance", studentPerf,
                "module_engagement",   List.of()
        ));
    }
}
