package lms.learnova.Controller;

import lms.learnova.DTOs.*;
import lms.learnova.Model.Course;
import lms.learnova.Model.Instructor;
import lms.learnova.Model.User;
import lms.learnova.Model.Video;
import lms.learnova.Model.PDF;
import lms.learnova.Repository.CourseContentRepo;
import lms.learnova.Repository.EnrollmentRepo;
import lms.learnova.Repository.InstructorRepo;
import lms.learnova.Repository.UserRepo;
import lms.learnova.Service.CourseContentService;
import lms.learnova.Service.CourseService;
import lms.learnova.Service.EnrollmentService;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
@RequestMapping("/courses")
public class CoursesApiController {

    private final CourseService        courseService;
    private final CourseContentService contentService;
    private final EnrollmentService    enrollmentService;
    private final EnrollmentRepo       enrollmentRepo;
    private final CourseContentRepo    contentRepo;
    private final UserRepo             userRepo;
    private final InstructorRepo       instructorRepo;

    public CoursesApiController(CourseService courseService,
                                CourseContentService contentService,
                                EnrollmentService enrollmentService,
                                EnrollmentRepo enrollmentRepo,
                                CourseContentRepo contentRepo,
                                UserRepo userRepo,
                                InstructorRepo instructorRepo) {
        this.courseService     = courseService;
        this.contentService    = contentService;
        this.enrollmentService = enrollmentService;
        this.enrollmentRepo    = enrollmentRepo;
        this.contentRepo       = contentRepo;
        this.userRepo          = userRepo;
        this.instructorRepo    = instructorRepo;
    }

    // GET /courses
    @GetMapping
    public ResponseEntity<?> getAllCourses(
            @RequestParam(defaultValue = "1")   int    page,
            @RequestParam(defaultValue = "10")  int    size,
            @RequestParam(required = false)     String search,
            @RequestParam(required = false)     String category,
            @RequestParam(required = false)     String status,
            @RequestParam(required = false)     String mine) {

        Pageable pageable = PageRequest.of(Math.max(0, page - 1), size);
        Page<Course> coursePage;

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if ("true".equalsIgnoreCase(mine) && auth != null && auth.isAuthenticated()) {
                User user = userRepo.findByEmail(auth.getName());
                if (user instanceof Instructor) {
                    coursePage = courseService.getInstructorCourses(user.getId(), pageable);
                } else {
                    coursePage = courseService.getCoursesWithFilters(search, category, pageable);
                }
            } else {
                coursePage = courseService.getCoursesWithFilters(search, category, pageable);
            }
        } catch (Exception e) {
            coursePage = courseService.getCoursesWithFilters(search, category, pageable);
        }

        List<Map<String, Object>> content = coursePage.getContent().stream()
                .map(this::toCourseMap)
                .collect(Collectors.toList());

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("page",           coursePage.getNumber() + 1);
        pagination.put("size",           coursePage.getSize());
        pagination.put("total_elements", coursePage.getTotalElements());
        pagination.put("total_pages",    coursePage.getTotalPages());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content",    content);
        resp.put("pagination", pagination);
        return ResponseEntity.ok(resp);
    }

    // GET /courses/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Long id) {
        Course course = courseService.getCourseById(id);
        List<CourseContentDTO> materials = contentService.getCourseMaterialsAsDTO(id);
        Map<String, Object> body = toCourseMap(course);
        body.put("content", toModuleList(materials));
        return ResponseEntity.ok(body);
    }

    // GET /courses/{id}/content
    @GetMapping("/{id}/content")
    public ResponseEntity<?> getCourseContent(@PathVariable Long id) {
        List<CourseContentDTO> materials = contentService.getCourseMaterialsAsDTO(id);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("modules", toModuleList(materials));
        return ResponseEntity.ok(resp);
    }

    // POST /courses
    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody CreateCourseRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (!(user instanceof Instructor)) throw new UnauthorizedException("Only instructors can create courses");
        Course saved = courseService.addCourse(request, (Instructor) user);
        return ResponseEntity.status(HttpStatus.CREATED).body(toCourseMap(saved));
    }

    // PUT /courses/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id,
                                          @RequestBody UpdateCourseRequest request) {
        Course updated = courseService.updateCourse(id, request);
        return ResponseEntity.ok(toCourseMap(updated));
    }

    // DELETE /courses/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    // GET /courses/{courseId}/enrollments
    @GetMapping("/{courseId}/enrollments")
    public ResponseEntity<?> getCourseEnrollments(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "20") int size) {

        var enrollments = enrollmentService.getEnrollmentsByCourse(courseId);
        List<Map<String, Object>> content = enrollments.stream().map(e -> {
            Map<String, Object> student = new LinkedHashMap<>();
            student.put("id",    e.getStudent().getId());
            student.put("name",  e.getStudent().getName());
            student.put("email", e.getStudent().getEmail());

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",              e.getId());
            m.put("student",         student);
            m.put("progress",        0);
            m.put("status",          e.getStatus());
            m.put("enrollment_date", e.getEnrollmentDate().toString());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("page",           page);
        pagination.put("size",           size);
        pagination.put("total_elements", content.size());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content",    content);
        resp.put("pagination", pagination);
        return ResponseEntity.ok(resp);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Map<String, Object> toCourseMap(Course c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",          c.getId());
        m.put("title",       c.getTitle());
        m.put("description", c.getDescription());

        if (c.getCategory() != null) {
            Map<String, Object> cat = new LinkedHashMap<>();
            cat.put("id",   0);
            cat.put("name", c.getCategory());
            m.put("category", cat);
        } else {
            m.put("category", null);
        }

        if (c.getInstructor() != null) {
            Map<String, Object> instr = new LinkedHashMap<>();
            instr.put("id",   c.getInstructor().getId());
            instr.put("name", c.getInstructor().getName());
            m.put("instructor", instr);
        } else {
            m.put("instructor", null);
        }

        m.put("image_url",  null);
        m.put("rating",     0.0);
        m.put("status",     "ACTIVE");
        m.put("created_at", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);

        long enrollCount = 0, videoCount = 0;
        try {
            enrollCount = enrollmentRepo.findByCourseId(c.getId()).stream()
                    .filter(e -> !"DROPPED".equalsIgnoreCase(e.getStatus())).count();
            List<lms.learnova.Model.CourseContent> allContent =
                    contentRepo.findByCourseIdOrderByOrderIndex(c.getId());
            videoCount  = allContent.stream().filter(x -> x instanceof Video).count();
        } catch (Exception ignored) {}

        m.put("students_count",    enrollCount);
        m.put("videos_count",      videoCount);
        return m;
    }

    private List<Map<String, Object>> toModuleList(List<CourseContentDTO> materials) {
        List<Map<String, Object>> lessons = materials.stream().map(mat -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id",            mat.getId());
            item.put("title",         mat.getTitle()       != null ? mat.getTitle()       : "Untitled");
            item.put("description",   mat.getDescription() != null ? mat.getDescription() : "");
            item.put("content_type",  mat.getContentType() != null ? mat.getContentType() : "VIDEO");
            item.put("video_url",     mat.getVideoUrl()    != null ? mat.getVideoUrl()    : "");
            item.put("duration",      mat.getDurationMinutes() != null ? mat.getDurationMinutes() : 0);
            item.put("order",         mat.getOrderIndex() != null ? mat.getOrderIndex() : 0);
            return item;
        }).collect(Collectors.toList());

        Map<String, Object> module = new LinkedHashMap<>();
        module.put("id",      1);
        module.put("title",   "Course Content");
        module.put("order",   1);
        module.put("lessons", lessons);
        return List.of(module);
    }
}
