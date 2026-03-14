package lms.learnova.Controller;

import lms.learnova.Service.CourseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * /categories — matches frontend API docs.
 *
 * Since there is no Category entity yet, we derive categories
 * dynamically from course.category strings and keep an in-memory
 * create/update/delete store.  A proper JPA entity can replace this later.
 */
@RestController
@RequestMapping("/categories")
public class CategoriesApiController {

    private final CourseService courseService;

    // In-memory store for admin-managed categories until a Category entity is added
    private final List<Map<String, Object>> extraCategories = new ArrayList<>();
    private final AtomicLong idSeq = new AtomicLong(1000);

    public CategoriesApiController(CourseService courseService) {
        this.courseService = courseService;
    }

    // GET /categories
    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size) {

        // Derive unique categories from existing courses
        List<Map<String, Object>> derived = courseService.getAllCourses().stream()
                .map(c -> c.getCategory())
                .filter(cat -> cat != null && !cat.isBlank())
                .distinct()
                .map(name -> Map.<String, Object>of(
                        "id",           name.hashCode() & 0xFFFFF,
                        "name",         name,
                        "description",  "",
                        "course_count", courseService.getAllCourses().stream()
                                .filter(c -> name.equals(c.getCategory())).count(),
                        "created_at",   Instant.now().toString()
                ))
                .collect(Collectors.toList());

        // Merge with admin-managed extras
        List<Map<String, Object>> all = new ArrayList<>(derived);
        all.addAll(extraCategories);

        return ResponseEntity.ok(Map.of(
                "content", all,
                "pagination", Map.of(
                        "page", page, "size", size,
                        "total_elements", all.size(),
                        "total_pages", 1
                )
        ));
    }

    // POST /categories
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        Map<String, Object> cat = Map.of(
                "id",          idSeq.getAndIncrement(),
                "name",        body.getOrDefault("name", ""),
                "description", body.getOrDefault("description", ""),
                "created_at",  Instant.now().toString()
        );
        extraCategories.add(cat);
        return ResponseEntity.status(HttpStatus.CREATED).body(cat);
    }

    // PUT /categories/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody Map<String, String> body) {
        Map<String, Object> updated = Map.of(
                "id",          id,
                "name",        body.getOrDefault("name", ""),
                "description", body.getOrDefault("description", ""),
                "updated_at",  Instant.now().toString()
        );
        return ResponseEntity.ok(updated);
    }

    // DELETE /categories/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        extraCategories.removeIf(c -> id.equals(c.get("id")));
        return ResponseEntity.noContent().build();
    }
}
