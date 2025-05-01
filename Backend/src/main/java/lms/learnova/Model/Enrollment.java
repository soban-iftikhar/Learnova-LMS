package lms.learnova.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter



@Entity
@Table(name = "enrollments")
public class Enrollment {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne
 @JoinColumn(name = "student_id", nullable = false)
 private Student student;

 @ManyToOne
 @JoinColumn(name = "course_id", nullable = false)
 private Course course;

 @Column(name = "enrollment_date")
 private LocalDate enrollmentDate = LocalDate.now();

 @Column(name = "status")
 private boolean active = true;


 public Enrollment(Student student, Course course){
  this.student = student;
  this.course = course;
 }


}