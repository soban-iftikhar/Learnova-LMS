package lms.learnova.Controller;

import lms.learnova.Service.CourseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/categories")
public class CategoriesApiController {

    private final CourseService courseService;
    private final List<Map<String, Object>> extraCategories = new ArrayList<>();
    private final AtomicLong idSeq = new AtomicLong(1000);

    public CategoriesApiController(CourseService courseService) {
        this.courseService = courseService;
    }

    // GET /categories
    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "50") int size) {

        List<Map<String, Object>> derived = courseService.getAllCourses().stream()
                .map(c -> c.getCategory())
                .filter(cat -> cat != null && !cat.isBlank())
                .distinct()
                .map(name -> {
                    long count = courseService.getAllCourses().stream()
                            .filter(c -> name.equals(c.getCategory())).count();
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",           name.hashCode() & 0xFFFFF);
                    m.put("name",         name);
                    m.put("description",  "");
                    m.put("course_count", count);
                    m.put("created_at",   Instant.now().toString());
                    return m;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> all = new ArrayList<>(derived);
        all.addAll(extraCategories);

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("page",           page);
        pagination.put("size",           size);
        pagination.put("total_elements", all.size());
        pagination.put("total_pages",    1);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content",    all);
        resp.put("pagination", pagination);
        return ResponseEntity.ok(resp);
    }

    // POST /categories
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        Map<String, Object> cat = new LinkedHashMap<>();
        cat.put("id",          idSeq.getAndIncrement());
        cat.put("name",        body.getOrDefault("name",        ""));
        cat.put("description", body.getOrDefault("description", ""));
        cat.put("created_at",  Instant.now().toString());
        extraCategories.add(cat);
        return ResponseEntity.status(HttpStatus.CREATED).body(cat);
    }

    // PUT /categories/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody Map<String, String> body) {
        Map<String, Object> updated = new LinkedHashMap<>();
        updated.put("id",          id);
        updated.put("name",        body.getOrDefault("name",        ""));
        updated.put("description", body.getOrDefault("description", ""));
        updated.put("updated_at",  Instant.now().toString());
        return ResponseEntity.ok(updated);
    }

    // DELETE /categories/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        extraCategories.removeIf(c -> id.equals(c.get("id")));
        return ResponseEntity.noContent().build();
    }
}
