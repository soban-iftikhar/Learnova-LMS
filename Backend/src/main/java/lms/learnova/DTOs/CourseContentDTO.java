package lms.learnova.DTOs;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CourseContentDTO {
    private Long id;
    private String title;
    private String description;
    private String contentType; // VIDEO, PDF
    private String filePath;
    private Long fileSize;
    private java.time.LocalDateTime uploadedAt;
}
