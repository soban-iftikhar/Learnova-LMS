package lms.learnova.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@DiscriminatorValue("PDF")
public class PDF extends CourseContent {
    @Column(name = "page_count")
    private Integer pageCount;
}
