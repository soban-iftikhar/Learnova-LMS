package lms.learnova.Repository;

import lms.learnova.Model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuizRepo extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCourseId(Long courseId);
    List<Quiz> findByCourseIdAndIsPublishedTrue(Long courseId);
    List<Quiz> findByStartTimeBeforeAndEndTimeAfter(LocalDateTime now1, LocalDateTime now2);
}
