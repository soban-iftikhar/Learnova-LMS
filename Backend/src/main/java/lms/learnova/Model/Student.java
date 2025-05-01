package lms.learnova.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;


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

    @Column(name = "enrollment_date")
    private String enrollmentDate;

    @JsonIgnore
    @ManyToMany(mappedBy = "enrolledStudents", fetch = FetchType.LAZY)
    private List<Course> courses = new ArrayList<>();

    @Override
    public String toString() {
        return "Student{" +
                "id=" + getId() +
                ", name='" + getName() + '\'' +
                ", email='" + getEmail() + '\'' +
                ", registrationNumber='" + registrationNumber + '\'' +
                ", degreeProgram='" + degreeProgram + '\'' +
                ", enrollmentDate='" + enrollmentDate + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Student)) return false;
        if (!super.equals(o)) return false;
        Student student = (Student) o;
        return registrationNumber.equals(student.registrationNumber) &&
                degreeProgram.equals(student.degreeProgram) &&
                enrollmentDate.equals(student.enrollmentDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), registrationNumber, degreeProgram, enrollmentDate);
    }
}
