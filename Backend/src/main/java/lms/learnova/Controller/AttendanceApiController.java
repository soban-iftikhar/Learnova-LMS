package lms.learnova.Controller;

import lms.learnova.Model.*;
import lms.learnova.Repository.AttendanceRepo;
import lms.learnova.Repository.EnrollmentRepo;
import lms.learnova.Repository.UserRepo;
import lms.learnova.Service.AttendanceService;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Attendance API.
 *
 * POST /attendance/mark               — teacher marks bulk attendance
 * GET  /attendance/student            — student gets their own attendance across all courses
 * GET  /attendance/course/{courseId}  — teacher gets attendance for a course
 */
@RestController
@RequestMapping("/attendance")
public class AttendanceApiController {

    private final AttendanceService attendanceService;
    private final AttendanceRepo    attendanceRepo;
    private final EnrollmentRepo    enrollmentRepo;
    private final UserRepo          userRepo;

    public AttendanceApiController(AttendanceService attendanceService,
                                   AttendanceRepo attendanceRepo,
                                   EnrollmentRepo enrollmentRepo,
                                   UserRepo userRepo) {
        this.attendanceService = attendanceService;
        this.attendanceRepo    = attendanceRepo;
        this.enrollmentRepo    = enrollmentRepo;
        this.userRepo          = userRepo;
    }

    /**
     * POST /attendance/mark
     * Body: { course_id, date, records: [{ student_id, enrollment_id, status }] }
     * Called by teacher Attendance page.
     */
    @PostMapping("/mark")
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> body) {
        Long instructorId = getCurrentUserId();

        String dateStr = body.containsKey("date") ? String.valueOf(body.get("date")) : LocalDate.now().toString();
        LocalDate classDate;
        try {
            classDate = LocalDate.parse(dateStr);
        } catch (Exception e) {
            classDate = LocalDate.now();
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> records = (List<Map<String, Object>>) body.get("records");
        if (records == null) records = new ArrayList<>();

        int saved = 0;
        for (Map<String, Object> rec : records) {
            Long enrollmentId = toLong(rec.get("enrollment_id"));
            if (enrollmentId == null) continue;

            String statusStr = rec.containsKey("status") ? String.valueOf(rec.get("status")) : "PRESENT";
            boolean isPresent = !"ABSENT".equalsIgnoreCase(statusStr);
            String remarks    = "LATE".equalsIgnoreCase(statusStr) ? "Late" : null;

            try {
                attendanceService.markAttendance(enrollmentId, classDate, isPresent, instructorId, remarks);
                saved++;
            } catch (Exception ignored) {}
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("message", "Attendance saved for " + classDate);
        resp.put("saved",   saved);
        resp.put("date",    classDate.toString());
        return ResponseEntity.ok(resp);
    }

    /**
     * GET /attendance/student
     * Returns attendance summary for the currently logged-in student.
     */
    @GetMapping("/student")
    public ResponseEntity<?> getStudentAttendance() {
        Long studentId = getCurrentUserId();
        List<Enrollment> enrollments = enrollmentRepo.findByStudentId(studentId).stream()
                .filter(e -> !"DROPPED".equalsIgnoreCase(e.getStatus()))
                .collect(Collectors.toList());

        List<Map<String, Object>> summaries = enrollments.stream().map(en -> {
            long total   = attendanceRepo.findByEnrollmentId(en.getId()).size();
            long present = attendanceRepo.countByEnrollmentIdAndIsPresentTrue(en.getId());
            double pct   = total == 0 ? 0.0 : Math.round((present * 100.0 / total) * 10.0) / 10.0;

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("enrollment_id",    en.getId());
            m.put("course_id",        en.getCourse().getId());
            m.put("course_title",     en.getCourse().getTitle());
            m.put("total_classes",    total);
            m.put("present",          present);
            m.put("absent",           total - present);
            m.put("percentage",       pct);
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("attendance", summaries);
        return ResponseEntity.ok(resp);
    }

    /**
     * GET /attendance/course/{courseId}
     * Returns per-student attendance for a course (teacher view).
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseAttendance(@PathVariable Long courseId) {
        List<Enrollment> enrollments = enrollmentRepo.findByCourseId(courseId).stream()
                .filter(e -> !"DROPPED".equalsIgnoreCase(e.getStatus()))
                .collect(Collectors.toList());

        List<Map<String, Object>> studentSummaries = enrollments.stream().map(en -> {
            long total   = attendanceRepo.findByEnrollmentId(en.getId()).size();
            long present = attendanceRepo.countByEnrollmentIdAndIsPresentTrue(en.getId());
            double pct   = total == 0 ? 0.0 : Math.round((present * 100.0 / total) * 10.0) / 10.0;

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("enrollment_id", en.getId());
            m.put("student_id",    en.getStudent().getId());
            m.put("student_name",  en.getStudent().getName());
            m.put("student_email", en.getStudent().getEmail());
            m.put("total_classes", total);
            m.put("present",       present);
            m.put("absent",        total - present);
            m.put("percentage",    pct);
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("course_id", courseId);
        resp.put("students",  studentSummaries);
        return ResponseEntity.ok(resp);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }

    private Long toLong(Object val) {
        if (val == null)            return null;
        if (val instanceof Integer) return ((Integer) val).longValue();
        if (val instanceof Long)    return (Long) val;
        try { return Long.parseLong(val.toString()); } catch (Exception e) { return null; }
    }
}
