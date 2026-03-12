package lms.learnova.DTOs;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentAnswerDTO {
    private Long id;
    private Long studentId;
    private Long quizId;
    private Long questionId;
    private String selectedAnswer;
    private Boolean isCorrect;
    private Integer marksObtained;
    private java.time.LocalDateTime submittedAt;
}
