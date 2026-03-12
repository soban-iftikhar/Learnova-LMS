package lms.learnova.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "course_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "content_type", discriminatorType = DiscriminatorType.STRING)
public class CourseContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "content_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_size") // in bytes
    private Long fileSize;

    @Column(name = "uploaded_at")
    private java.time.LocalDateTime uploadedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by") // Instructor ID
    private Instructor uploadedBy;

    @Column(name = "is_published")
    private Boolean isPublished = true;

    @Column(name = "order_index")
    private Integer orderIndex; // for ordering content within course

    @PrePersist
    protected void onCreate() {
        uploadedAt = java.time.LocalDateTime.now();
    }
}
