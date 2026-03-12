package lms.learnova.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_answers", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "quiz_id", "question_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    @Column(name = "selected_answer")
    private String selectedAnswer; // A, B, C, D, or null if not answered

    @Column(name = "is_correct")
    private Boolean isCorrect = false;

    @Column(name = "marks_obtained")
    private Integer marksObtained = 0;

    @Column(name = "submitted_at", nullable = false)
    private java.time.LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = java.time.LocalDateTime.now();
    }
}
