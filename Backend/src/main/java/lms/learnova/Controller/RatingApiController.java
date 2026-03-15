package lms.learnova.Controller;

import lms.learnova.Model.User;
import lms.learnova.Repository.CourseRepo;
import lms.learnova.Repository.EnrollmentRepo;
import lms.learnova.Repository.UserRepo;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Rating API — students rate the teacher after completing a course.
 * POST /courses/{courseId}/rate   { rating: 1-5, comment: "..." }
 * GET  /courses/{courseId}/rating
 */
@RestController
public class RatingApiController {

    private final UserRepo       userRepo;
    private final CourseRepo     courseRepo;
    private final EnrollmentRepo enrollmentRepo;

    private final ConcurrentHashMap<String, Map<String, Object>> ratingsStore = new ConcurrentHashMap<>();

    public RatingApiController(UserRepo userRepo, CourseRepo courseRepo, EnrollmentRepo enrollmentRepo) {
        this.userRepo       = userRepo;
        this.courseRepo     = courseRepo;
        this.enrollmentRepo = enrollmentRepo;
    }

    // POST /courses/{courseId}/rate
    @PostMapping("/courses/{courseId}/rate")
    public ResponseEntity<?> rateCourse(@PathVariable Long courseId,
                                         @RequestBody Map<String, Object> body) {
        Long studentId = getCurrentUserId();
        String key     = courseId + ":" + studentId;

        int    rating  = toInt(body.get("rating"), 5);
        String comment = body.containsKey("comment") ? String.valueOf(body.get("comment")) : "";

        String studentName = "Student";
        try {
            User user = userRepo.findById(studentId).orElse(null);
            if (user != null) studentName = user.getName();
        } catch (Exception ignored) {}

        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("student_id",   studentId);
        entry.put("student_name", studentName);
        entry.put("rating",       rating);
        entry.put("comment",      comment);
        entry.put("created_at",   Instant.now().toString());
        ratingsStore.put(key, entry);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("course_id", courseId);
        resp.put("rating",    rating);
        resp.put("comment",   comment);
        resp.put("message",   "Rating submitted successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    // GET /courses/{courseId}/rating
    @GetMapping("/courses/{courseId}/rating")
    public ResponseEntity<?> getCourseRating(@PathVariable Long courseId) {
        String prefix = courseId + ":";
        List<Map<String, Object>> reviews = ratingsStore.entrySet().stream()
                .filter(e -> e.getKey().startsWith(prefix))
                .map(Map.Entry::getValue)
                .collect(Collectors.toList());

        double avg = reviews.stream()
                .mapToInt(r -> toInt(r.get("rating"), 0))
                .average()
                .orElse(0.0);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("course_id",     courseId);
        resp.put("average",       Math.round(avg * 10.0) / 10.0);
        resp.put("total_ratings", reviews.size());
        resp.put("reviews",       reviews);
        return ResponseEntity.ok(resp);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }

    private int toInt(Object val, int def) {
        if (val == null)              return def;
        if (val instanceof Integer)   return (Integer) val;
        if (val instanceof Number)    return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return def; }
    }
}
