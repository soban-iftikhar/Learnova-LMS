package lms.learnova.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "instructors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Instructor extends User {

    @Column(name = "qualification")
    private String qualification;

    @Column(name = "experience")
    private String experience;

    @Column(name = "joining_date")
    private String joiningDate;

}
