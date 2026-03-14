package lms.learnova.DTOs;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CourseContentDTO {
    private Long id;
    private String title;
    private String description;
    private String contentType;       // "VIDEO" | "PDF"
    private String filePath;
    private Long fileSize;
    private LocalDateTime uploadedAt;

    // Video-specific
    private String videoUrl;
    private Integer durationMinutes;
    private String thumbnailPath;
    private Integer orderIndex;
    private Boolean isPublished;

    // PDF / Assignment-specific
    private Boolean isAssignment;
    private LocalDateTime dueDate;
    private Integer pageCount;
}
