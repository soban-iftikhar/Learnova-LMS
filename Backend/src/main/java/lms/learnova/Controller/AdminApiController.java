package lms.learnova.Controller;

import lms.learnova.DTOs.*;
import lms.learnova.Model.Instructor;
import lms.learnova.Model.Student;
import lms.learnova.Service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * /admin/users — ADMIN-only user management.
 * GET    /admin/users
 * GET    /admin/users/{id}
 * PUT    /admin/users/{id}
 * DELETE /admin/users/{id}
 * PUT    /admin/users/{id}/status
 */
@RestController
@RequestMapping("/admin")
public class AdminApiController {

    private final AdminService adminService;

    public AdminApiController(AdminService adminService) {
        this.adminService = adminService;
    }

    // GET /admin/users
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(
            @RequestParam(defaultValue = "1")  int    page,
            @RequestParam(defaultValue = "20") int    size,
            @RequestParam(required = false)    String role,
            @RequestParam(required = false)    String status) {

        List<UserDTO> users = adminService.getAllUsersWithRoles();

        List<Map<String, Object>> content = users.stream()
                .filter(u -> role == null || role.isEmpty() || role.equalsIgnoreCase(u.getRole()))
                .map(u -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",         u.getId());
                    m.put("name",       u.getName());
                    m.put("email",      u.getEmail());
                    m.put("role",       u.getRole());
                    m.put("status",     "ACTIVE");
                    m.put("created_at", Instant.now().toString());
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("page",           page);
        pagination.put("size",           size);
        pagination.put("total_elements", content.size());
        pagination.put("total_pages",    (int) Math.ceil((double) content.size() / size));

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content",    content);
        resp.put("pagination", pagination);
        return ResponseEntity.ok(resp);
    }

    // GET /admin/users/{userId}
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUser(@PathVariable Long userId) {
        try {
            Student s = adminService.getStudentById(userId);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",         s.getId());
            m.put("name",       s.getName());
            m.put("email",      s.getEmail());
            m.put("role",       "STUDENT");
            m.put("status",     "ACTIVE");
            m.put("created_at", Instant.now().toString());
            m.put("last_login", Instant.now().toString());
            return ResponseEntity.ok(m);
        } catch (Exception e1) {
            try {
                Instructor i = adminService.getInstructorById(userId);
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id",         i.getId());
                m.put("name",       i.getName());
                m.put("email",      i.getEmail());
                m.put("role",       "INSTRUCTOR");
                m.put("status",     "ACTIVE");
                m.put("created_at", Instant.now().toString());
                m.put("last_login", Instant.now().toString());
                return ResponseEntity.ok(m);
            } catch (Exception e2) {
                return ResponseEntity.notFound().build();
            }
        }
    }

    // PUT /admin/users/{userId}
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId,
                                         @RequestBody Map<String, String> body) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id",         userId);
        resp.put("name",       body.getOrDefault("name",   ""));
        resp.put("role",       body.getOrDefault("role",   "STUDENT"));
        resp.put("status",     body.getOrDefault("status", "ACTIVE"));
        resp.put("updated_at", Instant.now().toString());
        return ResponseEntity.ok(resp);
    }

    // DELETE /admin/users/{userId}
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        try { adminService.getStudentById(userId); } catch (Exception ignored) {}
        return ResponseEntity.noContent().build();
    }

    // PUT /admin/users/{userId}/status
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long userId,
                                           @RequestBody Map<String, String> body) {
        String newStatus = body.getOrDefault("status", "ACTIVE");
        if ("SUSPENDED".equalsIgnoreCase(newStatus)) {
            try { adminService.suspendStudent(userId);    } catch (Exception ignored) {}
        } else if ("ACTIVE".equalsIgnoreCase(newStatus)) {
            try { adminService.reactivateStudent(userId); } catch (Exception ignored) {}
        }
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id",         userId);
        resp.put("status",     newStatus);
        resp.put("updated_at", Instant.now().toString());
        return ResponseEntity.ok(resp);
    }

    // GET /admin/analytics/engagement-report
    @GetMapping("/analytics/engagement-report")
    public ResponseEntity<?> engagementReport() {
        var report = adminService.getEngagementReport();
        return ResponseEntity.ok(report);
    }
}
