package lms.learnova.Model;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Student extends User {


    @Column(name = "registration_number", nullable = false)
    private String registrationNumber;

    @Column(name = "degree_program")
    private String degreeProgram;

    @Column(name = "enrollment_date")
    private String enrollmentDate;


}
