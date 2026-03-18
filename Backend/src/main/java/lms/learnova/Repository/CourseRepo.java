package lms.learnova.Repository;

import lms.learnova.Model.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface CourseRepo extends JpaRepository<Course, Long> {
    Course findByTitle(String title);
    List<Course> findByInstructorId(Long instructorId);
    List<Course> findByInstructorIsNull();
    
    @Query("""
        SELECT c FROM Course c 
        WHERE (COALESCE(:search, '') = '' 
               OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (COALESCE(:category, '') = '' OR LOWER(c.category) = LOWER(:category))
        ORDER BY c.createdAt DESC
    """)
    Page<Course> findCoursesWithFilters(
        @Param("search") String search,
        @Param("category") String category,
        Pageable pageable
    );
    
    @Query("""
        SELECT c FROM Course c 
        WHERE c.instructor.id = :instructorId
        ORDER BY c.createdAt DESC
    """)
    Page<Course> findByInstructorIdPaginated(
        @Param("instructorId") Long instructorId,
        Pageable pageable
    );
}