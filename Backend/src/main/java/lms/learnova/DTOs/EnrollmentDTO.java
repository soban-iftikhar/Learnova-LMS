package lms.learnova.DTOs;

import java.time.LocalDate;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class EnrollmentDTO {
    private Long studentId;
    private Long courseId;
    private LocalDate enrollmentDate;
    private boolean active;

}