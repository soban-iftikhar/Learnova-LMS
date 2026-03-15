package lms.learnova.Controller;

import lms.learnova.Model.*;
import lms.learnova.Repository.CourseContentRepo;
import lms.learnova.Repository.CourseRepo;
import lms.learnova.Repository.UserRepo;
import lms.learnova.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Video lecture management for instructors.
 * GET    /courses/{courseId}/videos
 * POST   /courses/{courseId}/videos
 * PUT    /courses/{courseId}/videos/{videoId}
 * DELETE /courses/{courseId}/videos/{videoId}
 */
@RestController
public class VideoApiController {

    private final CourseRepo       courseRepo;
    private final CourseContentRepo contentRepo;
    private final UserRepo         userRepo;

    public VideoApiController(CourseRepo courseRepo,
                              CourseContentRepo contentRepo,
                              UserRepo userRepo) {
        this.courseRepo  = courseRepo;
        this.contentRepo = contentRepo;
        this.userRepo    = userRepo;
    }

    // GET /courses/{courseId}/videos
    @GetMapping("/courses/{courseId}/videos")
    public ResponseEntity<?> getCourseVideos(@PathVariable Long courseId) {
        List<Map<String, Object>> videos = contentRepo
                .findByCourseIdOrderByOrderIndex(courseId)
                .stream()
                .filter(c -> c instanceof Video)
                .map(c -> videoToMap((Video) c))
                .collect(Collectors.toList());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content", videos);
        return ResponseEntity.ok(resp);
    }

    // POST /courses/{courseId}/videos
    @PostMapping("/courses/{courseId}/videos")
    public ResponseEntity<?> addVideo(@PathVariable Long courseId,
                                       @RequestBody Map<String, Object> body) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        Video video = new Video();
        video.setCourse(course);
        video.setTitle(str(body, "title", "Untitled Video"));
        video.setDescription(str(body, "description", ""));
        video.setVideoUrl(str(body, "video_url", ""));
        video.setDurationMinutes(toInt(body.get("duration_minutes"), 0));
        video.setIsPublished(true);
        video.setOrderIndex(nextOrder(courseId));
        video.setUploadedAt(LocalDateTime.now());

        contentRepo.save(video);
        return ResponseEntity.status(HttpStatus.CREATED).body(videoToMap(video));
    }

    // PUT /courses/{courseId}/videos/{videoId}
    @PutMapping("/courses/{courseId}/videos/{videoId}")
    public ResponseEntity<?> updateVideo(@PathVariable Long courseId,
                                          @PathVariable Long videoId,
                                          @RequestBody Map<String, Object> body) {
        CourseContent content = contentRepo.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found: " + videoId));
        if (!(content instanceof Video)) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("error", "Not a video");
            return ResponseEntity.badRequest().body(err);
        }
        Video video = (Video) content;
        if (body.containsKey("title"))            video.setTitle(str(body, "title", video.getTitle()));
        if (body.containsKey("description"))      video.setDescription(str(body, "description", ""));
        if (body.containsKey("video_url"))        video.setVideoUrl(str(body, "video_url", ""));
        if (body.containsKey("duration_minutes")) video.setDurationMinutes(toInt(body.get("duration_minutes"), 0));
        contentRepo.save(video);
        return ResponseEntity.ok(videoToMap(video));
    }

    // DELETE /courses/{courseId}/videos/{videoId}
    @DeleteMapping("/courses/{courseId}/videos/{videoId}")
    public ResponseEntity<Void> deleteVideo(@PathVariable Long courseId,
                                             @PathVariable Long videoId) {
        contentRepo.deleteById(videoId);
        return ResponseEntity.noContent().build();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Map<String, Object> videoToMap(Video v) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",               v.getId());
        m.put("title",            v.getTitle()        != null ? v.getTitle()        : "");
        m.put("description",      v.getDescription()  != null ? v.getDescription()  : "");
        m.put("video_url",        v.getVideoUrl()     != null ? v.getVideoUrl()     : "");
        m.put("duration_minutes", v.getDurationMinutes() != null ? v.getDurationMinutes() : 0);
        m.put("order_index",      v.getOrderIndex()   != null ? v.getOrderIndex()   : 0);
        m.put("is_published",     v.getIsPublished()  != null ? v.getIsPublished()  : true);
        m.put("uploaded_at",      v.getUploadedAt()   != null ? v.getUploadedAt().toString() : "");
        return m;
    }

    private int nextOrder(Long courseId) {
        return (int) contentRepo.findByCourseIdOrderByOrderIndex(courseId).stream().count() + 1;
    }

    private String str(Map<String, Object> m, String key, String def) {
        Object v = m.get(key);
        return v != null ? v.toString() : def;
    }

    private Integer toInt(Object val, int def) {
        if (val == null)            return def;
        if (val instanceof Integer) return (Integer) val;
        if (val instanceof Number)  return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return def; }
    }
}
