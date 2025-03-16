package lms.learnova.Repository;

import lms.learnova.Model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseRepo extends JpaRepository<Course, Long> {

    /**
     * Finds a course by its title.
     * @param title The title of the course.
     * @return The course that matches the given title.
     */
    Course findByTitle(String title);

    /**
     * Finds all courses that belong to a specific category.
     * @param category The category of the course.
     * @return List of courses within the given category.
     */
    List<Course> findByCategory(String category);

    /**
     * Finds all courses taught by a specific instructor.
     * @param instructorId The ID of the instructor.
     * @return List of courses taught by the instructor.
     */
    List<Course> findByInstructorId(Long instructorId);

    /**
     * Retrieves the list of student names enrolled in a specific course.
     * @param courseId The ID of the course.
     * @return List of student names.
     */
    @Query("SELECT s.name FROM Student s JOIN s.courses c WHERE c.id = :courseId")
    List<String> findEnrolledStudentsByCourseId(@Param("courseId") Long courseId);

    /**
     * Enrolls a student in a course.
     * This would typically be done in the service layer using a mapped relationship.
     */
    @Query(value = "INSERT INTO course_student (course_id, student_id) VALUES (:courseId, :studentId)", nativeQuery = true)
    void enrollStudent(@Param("courseId") Long courseId, @Param("studentId") Long studentId);

    /**
     * Unenrolls a student from a course.
     * This would typically be done in the service layer using a mapped relationship.
     */
    @Query(value = "DELETE FROM course_student WHERE course_id = :courseId AND student_id = :studentId", nativeQuery = true)
    void unenrollStudent(@Param("courseId") Long courseId, @Param("studentId") Long studentId);
}
