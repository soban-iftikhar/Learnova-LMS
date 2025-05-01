package lms.learnova.Repository;

import lms.learnova.Model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseRepo extends JpaRepository<Course, Long> {
    Course findByTitle(String title);
    List<Course> findByInstructorId(Long instructorId);


}