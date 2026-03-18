package lms.learnova.Repository;

import lms.learnova.Model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    Optional<Rating> findByCourseIdAndStudentId(Long courseId, Long studentId);

    List<Rating> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    @Query("SELECT AVG(r.ratingValue) FROM Rating r WHERE r.courseId = :courseId")
    Double getAverageRatingForCourse(@Param("courseId") Long courseId);

    @Query("SELECT AVG(r.ratingValue) FROM Rating r WHERE r.courseId IN :courseIds")
    Double getAverageRatingForCourses(@Param("courseIds") List<Long> courseIds);

    long countByCourseId(Long courseId);

    void deleteByCourseId(Long courseId);
}
