package lms.learnova.DTOs;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private InstructorDTO instructor;
    private int enrolledCount;
    private java.time.LocalDateTime createdAt;
}
