package lms.learnova.Controller;

import lms.learnova.DTOs.*;
import lms.learnova.Model.Course;
import lms.learnova.Service.CourseContentService;
import lms.learnova.Service.CourseService;
import lms.learnova.Service.EnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for /courses — aligned with frontend API documentation.
 *
 * GET  /courses              → paginated list
 * GET  /courses/{id}         → single course
 * GET  /courses/{id}/content → modules + lessons
 * POST /courses              → create (INSTRUCTOR/ADMIN)
 * PUT  /courses/{id}         → update
 * DELETE /courses/{id}       → delete
 */
@RestController
@RequestMapping("/courses")
public class CoursesApiController {

    private final CourseService courseService;
    private final CourseContentService contentService;
    private final EnrollmentService enrollmentService;

    public CoursesApiController(CourseService courseService,
                                CourseContentService contentService,
                                EnrollmentService enrollmentService) {
        this.courseService = courseService;
        this.contentService = contentService;
        this.enrollmentService = enrollmentService;
    }

    // ─── GET /courses ─────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getAllCourses(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status
    ) {
        List<Course> all = courseService.getAllCourses();

        // Filter
        List<Course> filtered = all.stream()
                .filter(c -> search == null || search.isEmpty() ||
                        c.getTitle().toLowerCase().contains(search.toLowerCase()) ||
                        (c.getDescription() != null && c.getDescription().toLowerCase().contains(search.toLowerCase())))
                .filter(c -> category == null || category.isEmpty() ||
                        (c.getCategory() != null && c.getCategory().equalsIgnoreCase(category)))
                .collect(Collectors.toList());

        // Paginate
        int total = filtered.size();
        int totalPages = (int) Math.ceil((double) total / size);
        int from = Math.min((page - 1) * size, total);
        int to   = Math.min(from + size, total);
        List<Map<String, Object>> content = filtered.subList(from, to).stream()
                .map(this::toCourseMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "content", content,
                "pagination", Map.of(
                        "page", page,
                        "size", size,
                        "total_elements", total,
                        "total_pages", totalPages
                )
        ));
    }

    // ─── GET /courses/{id} ────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Long id) {
        Course course = courseService.getCourseById(id);
        List<CourseContentDTO> materials = contentService.getCourseMaterialsAsDTO(id);
        Map<String, Object> body = toCourseMap(course);
        body.put("content", toModuleList(materials));
        return ResponseEntity.ok(body);
    }

    // ─── GET /courses/{id}/content ────────────────────────────────────────────
    @GetMapping("/{id}/content")
    public ResponseEntity<?> getCourseContent(@PathVariable Long id) {
        List<CourseContentDTO> materials = contentService.getCourseMaterialsAsDTO(id);
        return ResponseEntity.ok(Map.of("modules", toModuleList(materials)));
    }

    // ─── POST /courses ────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody CreateCourseRequest request) {
        Course saved = courseService.addCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toCourseMap(saved));
    }

    // ─── PUT /courses/{id} ────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id,
                                          @RequestBody UpdateCourseRequest request) {
        Course updated = courseService.updateCourse(id, request);
        return ResponseEntity.ok(toCourseMap(updated));
    }

    // ─── DELETE /courses/{id} ─────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    // ─── GET /courses/{courseId}/enrollments ─────────────────────────────────
    @GetMapping("/{courseId}/enrollments")
    public ResponseEntity<?> getCourseEnrollments(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {

        var enrollments = enrollmentService.getEnrollmentsByCourse(courseId);
        var content = enrollments.stream().map(e -> Map.of(
                "id",              e.getId(),
                "student",         Map.of("id", e.getStudent().getId(), "name", e.getStudent().getName(), "email", e.getStudent().getEmail()),
                "progress",        0,
                "status",          e.getStatus(),
                "enrollment_date", e.getEnrollmentDate().toString()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("content", content,
                "pagination", Map.of("page", page, "size", size, "total_elements", content.size())));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private java.util.LinkedHashMap<String, Object> toCourseMap(Course c) {
        java.util.LinkedHashMap<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("id",             c.getId());
        m.put("title",          c.getTitle());
        m.put("description",    c.getDescription());
        m.put("category",       c.getCategory() != null
                ? Map.of("id", 0, "name", c.getCategory()) : null);
        m.put("instructor",     c.getInstructor() != null
                ? Map.of("id", c.getInstructor().getId(), "name", c.getInstructor().getName()) : null);
        m.put("students_count", c.getEnrollments().size());
        m.put("rating",         4.5);   // placeholder until ratings table is implemented
        m.put("image_url",      null);
        m.put("status",         "ACTIVE");
        m.put("created_at",     c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
        return m;
    }

    /** Wrap flat content list into a module-grouped structure for the frontend. */
    private List<Map<String, Object>> toModuleList(List<CourseContentDTO> materials) {
        // Group by a synthetic "module" based on order
        // Each content item becomes a "lesson" inside a single module for now
        List<Map<String, Object>> lessons = materials.stream().map(m -> Map.<String, Object>of(
                "id",          m.getId(),
                "title",       m.getTitle() != null ? m.getTitle() : "Untitled",
                "description", m.getDescription() != null ? m.getDescription() : "",
                "video_url",   m.getVideoUrl() != null ? m.getVideoUrl() : "",
                "duration",    m.getDurationMinutes() != null ? m.getDurationMinutes() : 0,
                "order",       m.getOrderIndex() != null ? m.getOrderIndex() : 0
        )).collect(Collectors.toList());

        return List.of(Map.of(
                "id",      1,
                "title",   "Course Content",
                "order",   1,
                "lessons", lessons
        ));
    }
}
