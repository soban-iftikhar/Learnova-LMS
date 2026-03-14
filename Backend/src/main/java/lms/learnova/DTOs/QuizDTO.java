package lms.learnova.DTOs;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuizDTO {
    private Long id;
    private String title;
    private String description;
    private Integer maxScore;
    private Integer timeLimitSeconds;
    private java.time.LocalDateTime startTime;
    private java.time.LocalDateTime endTime;
    private Boolean isPublished;
    private int questionCount;
}
