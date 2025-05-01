package lms.learnova.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.Objects;

@Entity

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@PrimaryKeyJoinColumn(name = "user_id")
@Table(name = "instructors")
public class Instructor extends User {

    @Column(name = "qualification")
    private String qualification;

    @Column(name = "experience")
    private String experience;

    @Column(name = "joining_date")
    private String joiningDate;

    @OneToMany(mappedBy = "instructor", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Course> courses;


    @Override
    public String toString() {
        return "Instructor{" +
                "id=" + getId() +
                ", name='" + getName() + '\'' +
                ", email='" + getEmail() + '\'' +
                ", qualification='" + qualification + '\'' +
                ", experience='" + experience + '\'' +
                ", joiningDate='" + joiningDate + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Instructor)) return false;
        if (!super.equals(o)) return false;
        Instructor that = (Instructor) o;
        return qualification.equals(that.qualification) &&
                experience.equals(that.experience) &&
                joiningDate.equals(that.joiningDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), qualification, experience, joiningDate);
    }

}
