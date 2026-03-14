package lms.learnova.DTOs;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultDTO {
    private Long quizId;
    private String quizTitle;
    private Integer marksObtained;
    private Integer maxMarks;
    private Double percentage;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private java.time.LocalDateTime submittedAt;
}
