package lms.learnova.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attendance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Column(name = "class_date", nullable = false)
    private java.time.LocalDate classDate;

    @Column(name = "is_present", nullable = false)
    private Boolean isPresent = false;

    @Column(name = "marked_at")
    private java.time.LocalDateTime markedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marked_by") // Instructor ID who marked attendance
    private Instructor markedBy;

    @Column(name = "remarks")
    private String remarks; // e.g., "Late", "Absent with permission"

    @PrePersist
    protected void onCreate() {
        if (markedAt == null) {
            markedAt = java.time.LocalDateTime.now();
        }
    }
}
