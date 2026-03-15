package lms.learnova.Controller;

import lms.learnova.Model.Enrollment;
import lms.learnova.Model.User;
import lms.learnova.Repository.EnrollmentRepo;
import lms.learnova.Repository.QuizRepo;
import lms.learnova.Repository.StudentAnswerRepo;
import lms.learnova.Repository.UserRepo;
import lms.learnova.Service.EnrollmentService;
import lms.learnova.Service.StudentService;
import lms.learnova.exception.ResourceNotFoundException;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/enrollments")
public class EnrollmentsApiController {

    private final EnrollmentService enrollmentService;
    private final EnrollmentRepo    enrollmentRepo;
    private final StudentService    studentService;
    private final UserRepo          userRepo;
    private final QuizRepo          quizRepo;
    private final StudentAnswerRepo studentAnswerRepo;

    public EnrollmentsApiController(EnrollmentService enrollmentService,
                                    EnrollmentRepo enrollmentRepo,
                                    StudentService studentService,
                                    UserRepo userRepo,
                                    QuizRepo quizRepo,
                                    StudentAnswerRepo studentAnswerRepo) {
        this.enrollmentService = enrollmentService;
        this.enrollmentRepo    = enrollmentRepo;
        this.studentService    = studentService;
        this.userRepo          = userRepo;
        this.quizRepo          = quizRepo;
        this.studentAnswerRepo = studentAnswerRepo;
    }

    // POST /enrollments
    @PostMapping
    public ResponseEntity<?> enroll(@RequestBody Map<String, Object> body) {
        Long courseId  = toLong(body.get("course_id"));
        Long studentId = getCurrentStudentId();
        Enrollment enrollment = enrollmentService.enrollStudent(studentId, courseId);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id",              enrollment.getId());
        resp.put("student_id",      studentId);
        resp.put("course_id",       courseId);
        resp.put("enrollment_date", enrollment.getEnrollmentDate().toString());
        resp.put("status",          enrollment.getStatus());
        resp.put("progress",        0);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    // GET /enrollments/my-courses
    @GetMapping("/my-courses")
    public ResponseEntity<?> getMyCourses(
            @RequestParam(defaultValue = "1")  int    page,
            @RequestParam(defaultValue = "20") int    size,
            @RequestParam(required = false)    String status) {

        Long studentId = getCurrentStudentId();
        List<Enrollment> all = enrollmentService.getEnrollmentsByStudent(studentId);

        List<Enrollment> filtered = all.stream()
                .filter(e -> !"DROPPED".equalsIgnoreCase(e.getStatus()))
                .filter(e -> status == null || status.isBlank() || status.equalsIgnoreCase(e.getStatus()))
                .collect(Collectors.toList());

        int total      = filtered.size();
        int totalPages = (int) Math.ceil((double) total / size);
        int from       = Math.min((page - 1) * size, total);
        int to         = Math.min(from + size, total);

        // Count all enrollments PER COURSE in one shot to avoid N+1 queries
        // Build a map of courseId → count using only the enrollments we already fetched
        Map<Long, Long> courseStudentCount = new java.util.HashMap<>();
        for (Enrollment e : filtered) {
            Long cid = e.getCourse().getId();
            courseStudentCount.computeIfAbsent(cid, k ->
                (long) enrollmentRepo.findByCourseId(k).stream()
                    .filter(en -> !"DROPPED".equalsIgnoreCase(en.getStatus())).count()
            );
        }

        List<Map<String, Object>> content = filtered.subList(from, to).stream()
                .map(e -> {
                    var course = e.getCourse();
                    long studentCount = courseStudentCount.getOrDefault(course.getId(), 0L);
                    int  progress     = calculateProgress(studentId, course.getId());

                    Map<String, Object> cat = new LinkedHashMap<>();
                    if (course.getCategory() != null) {
                        cat.put("id", 0); cat.put("name", course.getCategory());
                    }
                    Map<String, Object> instr = new LinkedHashMap<>();
                    if (course.getInstructor() != null) {
                        instr.put("id",   course.getInstructor().getId());
                        instr.put("name", course.getInstructor().getName());
                    }
                    Map<String, Object> courseMap = new LinkedHashMap<>();
                    courseMap.put("id",             course.getId());
                    courseMap.put("title",          course.getTitle());
                    courseMap.put("description",    course.getDescription() != null ? course.getDescription() : "");
                    courseMap.put("category",       cat.isEmpty() ? null : cat);
                    courseMap.put("instructor",     instr.isEmpty() ? null : instr);
                    courseMap.put("image_url",      null);
                    courseMap.put("students_count", studentCount);

                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",              e.getId());
                    m.put("progress",        progress);
                    m.put("status",          e.getStatus());
                    m.put("enrollment_date", e.getEnrollmentDate().toString());
                    m.put("course",          courseMap);
                    return m;
                }).collect(Collectors.toList());

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("page", page); pagination.put("size", size);
        pagination.put("total_elements", total); pagination.put("total_pages", totalPages);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content",    content);
        resp.put("pagination", pagination);
        return ResponseEntity.ok(resp);
    }

    // DELETE /enrollments/{enrollmentId}
    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<Void> unenroll(@PathVariable Long enrollmentId) {
        Long studentId = getCurrentStudentId();
        Enrollment enrollment = enrollmentRepo.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found: " + enrollmentId));
        if (!enrollment.getStudent().getId().equals(studentId))
            throw new UnauthorizedException("Cannot unenroll from another student's enrollment");
        enrollment.setStatus("DROPPED");
        enrollmentRepo.save(enrollment);
        return ResponseEntity.noContent().build();
    }

    // PUT /enrollments/{enrollmentId}/complete  — teacher marks student as complete
    @PutMapping("/{enrollmentId}/complete")
    public ResponseEntity<?> markComplete(@PathVariable Long enrollmentId) {
        Enrollment enrollment = enrollmentRepo.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found: " + enrollmentId));
        enrollment.setStatus("COMPLETED");
        enrollmentRepo.save(enrollment);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id",              enrollment.getId());
        resp.put("status",          "COMPLETED");
        resp.put("student_name",    enrollment.getStudent().getName());
        resp.put("course_title",    enrollment.getCourse().getTitle());
        resp.put("message",         "Course marked as complete.");
        return ResponseEntity.ok(resp);
    }

    // ─── Progress ────────────────────────────────────────────────────────────
    private int calculateProgress(Long studentId, Long courseId) {
        try {
            long total = quizRepo.findByCourseIdAndIsPublishedTrue(courseId).size();
            if (total == 0) return 0;
            long attempted = studentAnswerRepo.findByStudentId(studentId).stream()
                    .filter(a -> a.getQuiz() != null && a.getQuiz().getCourse() != null
                            && courseId.equals(a.getQuiz().getCourse().getId()))
                    .map(a -> a.getQuiz().getId()).distinct().count();
            return (int) Math.min(100, attempted * 100 / total);
        } catch (Exception ignored) { return 0; }
    }

    private Long getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }

    private Long toLong(Object val) {
        if (val instanceof Integer) return ((Integer) val).longValue();
        if (val instanceof Long)    return (Long) val;
        return Long.parseLong(val.toString());
    }
}
