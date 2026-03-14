package lms.learnova.DTOs;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long id;
    private Long enrollmentId;
    private java.time.LocalDate classDate;
    private Boolean isPresent;
    private String remarks;
    private java.time.LocalDateTime markedAt;
}
