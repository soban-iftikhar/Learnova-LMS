package lms.learnova.Repository;

import lms.learnova.Model.CourseContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseContentRepo extends JpaRepository<CourseContent, Long> {
    List<CourseContent> findByCourseIdOrderByOrderIndex(Long courseId);
}
