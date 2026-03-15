package lms.learnova.Controller;

import lms.learnova.Model.User;
import lms.learnova.Repository.UserRepo;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Simple polling-based chat between students and teacher per course.
 *
 * GET  /chat/{courseId}/messages          — get all messages for this course
 * POST /chat/{courseId}/messages          — send a message
 * GET  /chat/{courseId}/messages?since=   — poll for new messages (timestamp)
 */
@RestController
@RequestMapping("/chat")
public class ChatApiController {

    // Key: courseId → list of messages
    private final ConcurrentHashMap<Long, List<Map<String, Object>>> chatStore = new ConcurrentHashMap<>();
    private final AtomicLong idSeq = new AtomicLong(1);

    private final UserRepo userRepo;

    public ChatApiController(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    // GET /chat/{courseId}/messages
    @GetMapping("/{courseId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable Long courseId,
            @RequestParam(required = false) String since) {

        List<Map<String, Object>> messages = chatStore.getOrDefault(courseId, new ArrayList<>());

        // If a 'since' ISO timestamp is supplied, return only newer messages
        if (since != null && !since.isBlank()) {
            try {
                Instant sinceInstant = Instant.parse(since);
                messages = messages.stream()
                        .filter(m -> Instant.parse(String.valueOf(m.get("timestamp"))).isAfter(sinceInstant))
                        .collect(Collectors.toList());
            } catch (Exception ignored) {}
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("messages", messages);
        return ResponseEntity.ok(resp);
    }

    // POST /chat/{courseId}/messages
    @PostMapping("/{courseId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long courseId,
            @RequestBody Map<String, Object> body) {

        User sender = currentUser();
        String text = body.containsKey("text") ? String.valueOf(body.get("text")).trim() : "";
        if (text.isEmpty()) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("error", "Message text is required");
            return ResponseEntity.badRequest().body(err);
        }

        Map<String, Object> msg = new LinkedHashMap<>();
        msg.put("id",            idSeq.getAndIncrement());
        msg.put("course_id",     courseId);
        msg.put("sender_id",     sender.getId());
        msg.put("sender_name",   sender.getName());
        msg.put("sender_role",   sender.getRole().name());
        msg.put("text",          text);
        msg.put("timestamp",     Instant.now().toString());

        chatStore.computeIfAbsent(courseId, k -> Collections.synchronizedList(new ArrayList<>())).add(msg);

        // Keep last 200 messages per course to avoid unbounded growth
        List<Map<String, Object>> msgs = chatStore.get(courseId);
        if (msgs.size() > 200) {
            chatStore.put(courseId, msgs.subList(msgs.size() - 200, msgs.size()));
        }

        return ResponseEntity.ok(msg);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────
    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user;
    }
}
