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
 * Polling-based chat supporting:
 * - Private channel: courseId__studentId  (teacher ↔ one student)
 * - Broadcast channel: courseId           (teacher → all students, visible to all in course)
 *
 * Student always reads/writes on the private channel (courseId__studentId).
 * Teacher can read/write private channels or the broadcast channel.
 *
 * GET  /chat/{channelId}/messages
 * POST /chat/{channelId}/messages
 * GET  /chat/{channelId}/messages?since=
 */
@RestController
@RequestMapping("/chat")
public class ChatApiController {

    private final ConcurrentHashMap<String, List<Map<String, Object>>> chatStore = new ConcurrentHashMap<>();
    private final AtomicLong idSeq = new AtomicLong(1);
    private final UserRepo userRepo;

    public ChatApiController(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/{channelId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable String channelId,
            @RequestParam(required = false) String since) {

        List<Map<String, Object>> msgs = new ArrayList<>(
                chatStore.getOrDefault(channelId, new ArrayList<>()));

        if (since != null && !since.isBlank()) {
            try {
                Instant sinceI = Instant.parse(since);
                msgs = msgs.stream()
                        .filter(m -> Instant.parse(String.valueOf(m.get("timestamp"))).isAfter(sinceI))
                        .collect(Collectors.toList());
            } catch (Exception ignored) {}
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("messages", msgs);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{channelId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable String channelId,
            @RequestBody Map<String, Object> body) {

        User sender = currentUser();
        String text = body.containsKey("text") ? String.valueOf(body.get("text")).trim() : "";
        if (text.isEmpty()) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("error", "Message text is required");
            return ResponseEntity.badRequest().body(err);
        }

        Map<String, Object> msg = new LinkedHashMap<>();
        msg.put("id",          idSeq.getAndIncrement());
        msg.put("channel_id",  channelId);
        msg.put("sender_id",   sender.getId());
        msg.put("sender_name", sender.getName());
        msg.put("sender_role", sender.getRole().name());
        msg.put("text",        text);
        msg.put("timestamp",   Instant.now().toString());

        List<Map<String, Object>> list =
                chatStore.computeIfAbsent(channelId, k -> Collections.synchronizedList(new ArrayList<>()));
        list.add(msg);
        if (list.size() > 500) {
            chatStore.put(channelId, list.subList(list.size() - 500, list.size()));
        }

        return ResponseEntity.ok(msg);
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user;
    }
}
