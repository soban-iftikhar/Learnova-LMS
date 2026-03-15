package lms.learnova.Controller;

import lms.learnova.Service.AdminService;
import lms.learnova.Service.CourseService;
import lms.learnova.Service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class AnalyticsApiController {

    private final AdminService      adminService;
    private final CourseService     courseService;
    private final EnrollmentService enrollmentService;

    public AnalyticsApiController(AdminService adminService,
                                   CourseService courseService,
                                   EnrollmentService enrollmentService) {
        this.adminService      = adminService;
        this.courseService     = courseService;
        this.enrollmentService = enrollmentService;
    }

    // GET /analytics/engagement
    @GetMapping("/analytics/engagement")
    public ResponseEntity<?> getEngagement(
            @RequestParam(required = false) Long   course_id,
            @RequestParam(required = false) String start_date,
            @RequestParam(required = false) String end_date) {

        var report = adminService.getEngagementReport();
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("total_active_users",       report.getTotalActiveStudents());
        resp.put("total_sessions",           report.getTotalQuizAttempts());
        resp.put("average_session_duration", 45);
        resp.put("daily_activity",           new ArrayList<>());
        return ResponseEntity.ok(resp);
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
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("student_id",            e.getStudent().getId());
                    m.put("name",                  e.getStudent().getName());
                    m.put("progress",              0);
                    m.put("quiz_average",          0);
                    m.put("assignment_average",    0);
                    m.put("attendance_percentage", 0);
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("course_id",           courseId);
        resp.put("title",               course.getTitle());
        resp.put("total_students",      total);
        resp.put("active_students",     total);
        resp.put("completion_rate",     0);
        resp.put("average_score",       0.0);
        resp.put("engagement_rate",     0);
        resp.put("student_performance", studentPerf);
        resp.put("module_engagement",   new ArrayList<>());
        return ResponseEntity.ok(resp);
    }
}
