package lms.learnova.Controller;

import lms.learnova.Model.*;
import lms.learnova.Repository.RatingRepository;
import lms.learnova.Repository.UserRepo;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Objects;

/**
 * Ratings — persisted to database with caching.
 * GET  /courses/{courseId}/rating          — get course rating + reviews
 * GET  /courses/{courseId}/rating/summary  — average only (for dashboard)
 * POST /courses/{courseId}/rate            — student submits rating
 */
@RestController
public class RatingApiController {

    private final UserRepo       userRepo;
    private final RatingRepository ratingRepo;

    public RatingApiController(UserRepo userRepo, RatingRepository ratingRepo) {
        this.userRepo       = userRepo;
        this.ratingRepo     = ratingRepo;
    }

    // POST /courses/{courseId}/rate
    @PostMapping("/courses/{courseId}/rate")
    @Transactional
    @SuppressWarnings("ConstantConditions")
    public ResponseEntity<?> rateCourse(@PathVariable Long courseId,
                                         @RequestBody Map<String, Object> body) {
        try {
            Long studentId = Objects.requireNonNull(getCurrentUserId(), "Student ID cannot be null");
            int rating = toInt(body.get("rating"), 5);
            String comment = body.containsKey("comment") ? String.valueOf(body.get("comment")).trim() : "";

            String studentName = "Student";
            Optional<User> userOpt = userRepo.findById(studentId);
            if (userOpt.isPresent()) {
                studentName = userOpt.get().getName();
            }

            // Check if student already rated this course
            Optional<Rating> existing = ratingRepo.findByCourseIdAndStudentId(courseId, studentId);
            
            Rating ratingEntity;
            if (existing.isPresent()) {
                // Update existing rating
                ratingEntity = existing.get();
                ratingEntity.setRatingValue(rating);
                ratingEntity.setComment(comment);
            } else {
                // Create new rating
                ratingEntity = new Rating();
                ratingEntity.setCourseId(courseId);
                ratingEntity.setStudentId(studentId);
                ratingEntity.setStudentName(studentName);
                ratingEntity.setRatingValue(rating);
                ratingEntity.setComment(comment);
                ratingEntity.setCreatedAt(LocalDateTime.now());
            }

            Rating saved = ratingRepo.save(ratingEntity);

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("id", saved.getId());
            resp.put("course_id", courseId);
            resp.put("rating", rating);
            resp.put("message", existing.isPresent() ? "Rating updated successfully" : "Rating submitted successfully");
            return ResponseEntity.status(existing.isPresent() ? HttpStatus.OK : HttpStatus.CREATED).body(resp);

        } catch (UnauthorizedException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to save rating"));
        }
    }

    // GET /courses/{courseId}/rating
    @GetMapping("/courses/{courseId}/rating")
    public ResponseEntity<?> getCourseRating(@PathVariable Long courseId) {
        try {
            List<Rating> ratings = ratingRepo.findByCourseIdOrderByCreatedAtDesc(courseId);
            
            List<Map<String, Object>> reviews = ratings.stream()
                    .map(this::toReviewMap)
                    .collect(Collectors.toList());

            double avg = ratings.stream()
                    .mapToInt(Rating::getRatingValue)
                    .average()
                    .orElse(0.0);

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("course_id", courseId);
            resp.put("average", Math.round(avg * 10.0) / 10.0);
            resp.put("total_ratings", reviews.size());
            resp.put("reviews", reviews);
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch ratings"));
        }
    }

    /** Lightweight summary for dashboard */
    public double getAverageRating(Long courseId) {
        Double avg = ratingRepo.getAverageRatingForCourse(courseId);
        return (avg != null) ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    /** Average across multiple courses */
    public double getAverageRatingForCourses(List<Long> courseIds) {
        if (courseIds == null || courseIds.isEmpty()) return 0.0;
        Double avg = ratingRepo.getAverageRatingForCourses(courseIds);
        return (avg != null) ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    private Map<String, Object> toReviewMap(Rating rating) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", rating.getId());
        map.put("student_id", rating.getStudentId());
        map.put("student_name", rating.getStudentName());
        map.put("rating", rating.getRatingValue());
        map.put("comment", rating.getComment());
        map.put("created_at", rating.getCreatedAt().toString());
        return map;
    }

    private Long getCurrentUserId() throws UnauthorizedException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }

    private int toInt(Object val, int def) {
        if (val == null) return def;
        if (val instanceof Integer) return (Integer) val;
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); }
        catch (Exception e) { return def; }
    }
}
