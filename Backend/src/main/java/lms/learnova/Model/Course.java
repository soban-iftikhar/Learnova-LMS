package lms.learnova.Model;

import jakarta.persistence.*;
import java.util.List;
import java.util.Objects;
import lombok.*;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Course {

@Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "course_id")
    private int id;

    @Column(name = "course_title", nullable = false)
    private String title;

    @Column(name = "course_description")
    private String description;

    @Column(name = "course_category")
    private String category;

    @ManyToOne
    @JoinColumn(name = "instructor_id", nullable = false)
    private Instructor instructor;

    @ManyToMany
    @JoinTable(
            name = "course_enrollments",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private List<Student> enrolledStudents;

    @Override
    public String toString() {
        return "Course{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", category='" + category + '\'' +
                ", instructor=" + (instructor != null ? instructor.getId() : null) +
                ", enrolledStudents=" + (enrolledStudents != null ? enrolledStudents.size() : 0) +
                '}';
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Course)) return false;
        Course course = (Course) o;
        return id == course.id &&
                Objects.equals(title, course.title) &&
                Objects.equals(description, course.description) &&
                Objects.equals(category, course.category);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, description, category);
    }
}
