package lms.learnova.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.util.StringUtils;


@Entity

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@PrimaryKeyJoinColumn(name = "user_id")
@Table(name = "students")
public class Student extends User {

    @Column(name = "registration_number", nullable = false)
    private String registrationNumber;

    @Column(name = "degree_program")
    private String degreeProgram;

    @JsonIgnore
    @ManyToMany(mappedBy = "enrolledStudents", fetch = FetchType.LAZY)
    private List<Course> courses = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentAnswer> quizAnswers = new ArrayList<>();

    @PrePersist
    @PreUpdate
    private void ensureDefaults() {
        if (!StringUtils.hasText(this.registrationNumber)) {
            this.registrationNumber = "REG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }

    @Override
    public String toString() {
        return "Student{" +
                "id=" + getId() +
                ", name='" + getName() + '\'' +
                ", email='" + getEmail() + '\'' +
                ", registrationNumber='" + registrationNumber + '\'' +
                ", degreeProgram='" + degreeProgram + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Student)) return false;
        if (!super.equals(o)) return false;
        Student student = (Student) o;
        return Objects.equals(registrationNumber, student.registrationNumber) &&
            Objects.equals(degreeProgram, student.degreeProgram);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), registrationNumber, degreeProgram);
    }
}
