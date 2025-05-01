package lms.learnova.DTOs;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter

public class UpdateCourseRequest {
    private String title;
    private String description;
    private String category;
    private Long instructorId;
    // getters and setters
}
