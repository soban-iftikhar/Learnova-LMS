package lms.learnova.Repository;

import lms.learnova.Model.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;



public interface InstructorRepo extends JpaRepository<Instructor, Long> {

    Instructor findByEmail(String email);
}
