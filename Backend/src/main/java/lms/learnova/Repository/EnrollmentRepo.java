package lms.learnova.Repository;

import lms.learnova.Model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepo extends JpaRepository<Enrollment, Long> {

    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    List<Enrollment>     findByCourseId(Long courseId);
    List<Enrollment>     findByStudentId(Long studentId);
    boolean              existsByStudentIdAndCourseId(Long studentId, Long courseId);

    /**
     * Returns enrollments for a list of courses — used by the instructor dashboard
     * so we never call findAll() across the entire enrollments table.
     */
    @Query("""
            SELECT e FROM Enrollment e
            WHERE e.course.id IN :courseIds
              AND e.status <> 'DROPPED'
            ORDER BY e.enrollmentDate DESC
            """)
    List<Enrollment> findByCourseIdsActive(@Param("courseIds") List<Long> courseIds);
}
