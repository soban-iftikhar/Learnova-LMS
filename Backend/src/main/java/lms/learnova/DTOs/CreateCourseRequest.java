package lms.learnova.DTOs;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CreateCourseRequest {
    private String title;
    private String description;
    private String category;
    private String image_url;
    private String status = "DRAFT";
}

