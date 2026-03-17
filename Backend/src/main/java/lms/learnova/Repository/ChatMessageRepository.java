package lms.learnova.Repository;

import lms.learnova.Model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * Find all non-deleted messages in a channel, ordered by most recent first
     */
    List<ChatMessage> findByChannelIdAndIsDeletedFalseOrderByCreatedAtDesc(String channelId);

    /**
     * Find all non-deleted messages in a channel, ordered by oldest first
     */
    List<ChatMessage> findByChannelIdAndIsDeletedFalseOrderByCreatedAtAsc(String channelId);

    /**
     * Find expired messages for soft-delete cleanup
     */
    List<ChatMessage> findByIsDeletedFalseAndCreatedAtBefore(LocalDateTime cutoff);

    /**
     * Find messages by sender
     */
    List<ChatMessage> findBySenderIdAndIsDeletedFalse(Long senderId);

    /**
     * Soft-delete all messages in a channel
     */
    @Modifying
    @Query("UPDATE ChatMessage m SET m.isDeleted = true WHERE m.channelId = :channelId AND m.isDeleted = false")
    void softDeleteByChannelId(@Param("channelId") String channelId);

    /**
     * Count non-deleted messages in a channel
     */
    long countByChannelIdAndIsDeletedFalse(String channelId);
}
