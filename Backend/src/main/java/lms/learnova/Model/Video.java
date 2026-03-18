package lms.learnova.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@DiscriminatorValue("VIDEO")
public class Video extends CourseContent {
    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "thumbnail_path")
    private String thumbnailPath;

    @Column(name = "video_url")
    private String videoUrl;
}
