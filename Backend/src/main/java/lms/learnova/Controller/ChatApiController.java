package lms.learnova.Controller;

import lms.learnova.Model.ChatMessage;
import lms.learnova.Model.User;
import lms.learnova.Repository.ChatMessageRepository;
import lms.learnova.Repository.UserRepo;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Chat API — messages persisted to database with in-memory cache for performance.
 *
 * Channels:
 *  - Private:   "courseId__studentId"   (teacher ↔ one student)
 *  - Broadcast: "courseId"              (teacher → all students)
 *
 * Strategy:
 *  1. Save ALL messages to database immediately
 *  2. Keep in-memory cache of recent messages (max 500)
 *  3. Scheduled cleanup soft-deletes old messages (24+ hours)
 *
 * GET  /chat/{channelId}/messages
 * POST /chat/{channelId}/messages
 */
@RestController
@RequestMapping("/chat")
public class ChatApiController {

    private static final Logger logger = LoggerFactory.getLogger(ChatApiController.class);

    private final ConcurrentHashMap<String, List<Map<String, Object>>> messageCache =
            new ConcurrentHashMap<>();
    private final ChatMessageRepository chatMessageRepo;
    private final UserRepo   userRepo;

    public ChatApiController(ChatMessageRepository chatMessageRepo, UserRepo userRepo) {
        this.chatMessageRepo = chatMessageRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/{channelId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable String channelId,
            @RequestParam(required = false) String since) {

        try {
            User user = currentUser();
            validateChannelAccess(channelId, user);

            // Try cache first
            List<Map<String, Object>> cachedMsgs = messageCache.getOrDefault(channelId, new ArrayList<>());
            if (!cachedMsgs.isEmpty()) {
                List<Map<String, Object>> filtered = filterSince(cachedMsgs, since);
                Map<String, Object> resp = new LinkedHashMap<>();
                resp.put("messages", filtered);
                return ResponseEntity.ok(resp);
            }

            // Load from database
            List<ChatMessage> dbMsgs = chatMessageRepo
                    .findByChannelIdAndIsDeletedFalseOrderByCreatedAtDesc(channelId);
            
            refreshMessageCache(channelId, dbMsgs);
            
            List<Map<String, Object>> msgs = dbMsgs.stream()
                    .map(this::toMessageMap)
                    .collect(Collectors.toList());
            
            msgs = filterSince(msgs, since);

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("messages", msgs);
            return ResponseEntity.ok(resp);

        } catch (UnauthorizedException e) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch messages"));
        }
    }

    @PostMapping("/{channelId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable String channelId,
            @RequestBody Map<String, Object> body) {

        try {
            User sender = currentUser();
            validateChannelAccess(channelId, sender);

            String text = body.containsKey("text") ? String.valueOf(body.get("text")).trim() : "";
            if (text.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Message text is required"));
            }

            // Save to database
            ChatMessage msg = new ChatMessage();
            msg.setChannelId(channelId);
            msg.setSenderId(sender.getId());
            msg.setSenderName(sender.getName());
            msg.setSenderRole(sender.getRole() != null ? sender.getRole().name() : "STUDENT");
            msg.setText(text);
            msg.setCreatedAt(LocalDateTime.now());
            
            ChatMessage saved = chatMessageRepo.save(msg);
            
            // Update cache
            List<Map<String, Object>> cached = messageCache
                    .computeIfAbsent(channelId, k -> Collections.synchronizedList(new ArrayList<>()));
            cached.add(0, toMessageMap(saved));
            if (cached.size() > 500) {
                cached.subList(500, cached.size()).clear();
            }

            Map<String, Object> response = toMessageMap(saved);
            return ResponseEntity.ok(response);

        } catch (UnauthorizedException e) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of(
                        "error", "Failed to send message: " + e.getMessage(),
                        "type", e.getClass().getSimpleName()
                    ));
        }
    }

    /**
     * Runs every 30 min — soft-deletes messages older than 24 hours from database.
     */
    @Scheduled(fixedDelay = 30 * 60 * 1000L)
    public void evictExpiredMessages() {
        try {
            LocalDateTime cutoff = LocalDateTime.now().minus(24, ChronoUnit.HOURS);
            List<ChatMessage> expired = chatMessageRepo.findByIsDeletedFalseAndCreatedAtBefore(cutoff);
            for (ChatMessage msg : expired) {
                msg.setIsDeleted(true);
                chatMessageRepo.save(msg);
            }
            messageCache.clear();
        } catch (Exception e) {
            logger.error("Chat message cleanup failed", e);
        }
    }

    /**
     * Load messages from database into cache (max 500 most recent)
     */
    private void refreshMessageCache(String channelId, List<ChatMessage> messages) {
        List<Map<String, Object>> cached = messages.stream()
                .limit(500)
                .map(this::toMessageMap)
                .collect(Collectors.toCollection(
                        () -> Collections.synchronizedList(new ArrayList<>())));
        messageCache.put(channelId, cached);
    }

    /**
     * Convert ChatMessage entity to API response map
     */
    private Map<String, Object> toMessageMap(ChatMessage msg) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", msg.getId());
        map.put("channel_id", msg.getChannelId());
        map.put("sender_id", msg.getSenderId());
        map.put("sender_name", msg.getSenderName());
        map.put("sender_role", msg.getSenderRole());
        map.put("text", msg.getText());
        // Convert LocalDateTime to ISO-8601 string with UTC timezone
        Instant instant = msg.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant();
        map.put("timestamp", instant.toString());
        return map;
    }

    /**
     * Filter messages by 'since' timestamp parameter
     */
    private List<Map<String, Object>> filterSince(List<Map<String, Object>> messages, String since) {
        if (since == null || since.isBlank()) {
            return messages;
        }
        try {
            Instant sinceI = Instant.parse(since);
            return messages.stream()
                    .filter(m -> Instant.parse(String.valueOf(m.get("timestamp"))).isAfter(sinceI))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return messages;
        }
    }

    /**
     * Validate user access to channel:
     *  - Private: "courseId__studentId" — only teacher of course or the studentId
     *  - Broadcast: "courseId" — only teacher of course
     */
    private void validateChannelAccess(String channelId, User user) throws UnauthorizedException {
        // TODO: Implement channel access validation based on course and role
        // For now, allow all authenticated users
    }

    private User currentUser() throws UnauthorizedException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new UnauthorizedException("Not authenticated");
        }
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) {
            throw new UnauthorizedException("User not found");
        }
        return user;
    }
}
