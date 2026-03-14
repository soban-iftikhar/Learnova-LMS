package lms.learnova.Repository;

import lms.learnova.Model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepo extends JpaRepository<Student, Long > {

    Student findByEmail(String email);
}
