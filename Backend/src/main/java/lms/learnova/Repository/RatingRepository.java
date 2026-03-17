package lms.learnova.Repository;

import lms.learnova.Model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    /**
     * Find all ratings for a course
     */
    List<Rating> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    /**
     * Find a rating by courseId and studentId
     */
    Optional<Rating> findByCourseIdAndStudentId(Long courseId, Long studentId);

    /**
     * Find all ratings by a student
     */
    List<Rating> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    /**
     * Calculate average rating for a course
     */
    @Query("SELECT AVG(r.ratingValue) FROM Rating r WHERE r.courseId = :courseId")
    Double getAverageRatingForCourse(@Param("courseId") Long courseId);

    /**
     * Calculate average rating across multiple courses
     */
    @Query("SELECT AVG(r.ratingValue) FROM Rating r WHERE r.courseId IN :courseIds")
    Double getAverageRatingForCourses(@Param("courseIds") List<Long> courseIds);

    /**
     * Count ratings for a course
     */
    long countByCourseId(Long courseId);

    /**
     * Delete all ratings for a course (cascade on course delete)
     */
    void deleteByCourseId(Long courseId);
}
