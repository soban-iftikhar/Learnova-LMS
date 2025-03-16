package lms.learnova.Service;

import lms.learnova.Model.Course;
import lms.learnova.Repository.CourseRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepo courseRepository;

    /**
     * Retrieves all available courses.
     * @return List of all courses.
     */
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    /**
     * Retrieves a course by its ID.
     * @param id The ID of the course.
     * @return The course if found, otherwise throws an exception.
     */
    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course with ID " + id + " not found"));
    }

    /**
     * Adds a new course to the system.
     * @param course The course object to be added.
     * @return The saved course.
     */
    public Course addCourse(Course course) {
        return courseRepository.save(course);
    }

    /**
     * Updates an existing course.
     * @param id The ID of the course to update.
     * @param updatedCourse The updated course details.
     * @return The updated course.
     */
    public Course updateCourse(Long id, Course updatedCourse) {
        return courseRepository.findById(id).map(existingCourse -> {
            existingCourse.setTitle(updatedCourse.getTitle());
            existingCourse.setDescription(updatedCourse.getDescription());
            existingCourse.setInstructor(updatedCourse.getInstructor());
            return courseRepository.save(existingCourse);
        }).orElseThrow(() -> new RuntimeException("Course with ID " + id + " not found"));
    }

    /**
     * Deletes a course by its ID.
     * @param id The ID of the course to delete.
     */
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    /**
     * Searches for a course by its title.
     * @param title The title of the course.
     * @return The course that matches the title.
     */
    public Course searchCourseByTitle(String title) {
        return courseRepository.findByTitle(title);
    }

    /**
     * Searches for courses by category.
     * @param category The category of the course.
     * @return List of courses in the given category.
     */
    public List<Course> searchCourseByCategory(String category) {
        return courseRepository.findByCategory(category);
    }

    /**
     * Retrieves all courses taught by a specific instructor.
     * @param instructorId The ID of the instructor.
     * @return List of courses taught by the instructor.
     */
    public List<Course> getCoursesByInstructor(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }

    /**
     * Retrieves all students enrolled in a specific course.
     * @param courseId The ID of the course.
     * @return List of enrolled students.
     */
    public List<String> getEnrolledStudents(Long courseId) {
        return courseRepository.findEnrolledStudentsByCourseId(courseId);
    }

    /**
     * Enrolls a student in a course.
     * @param courseId The ID of the course.
     * @param studentId The ID of the student.
     */
    public void enrollStudent(Long courseId, Long studentId) {
        courseRepository.enrollStudent(courseId, studentId);
    }

    /**
     * Unenrolls a student from a course.
     * @param courseId The ID of the course.
     * @param studentId The ID of the student.
     */
    public void unenrollStudent(Long courseId, Long studentId) {
        courseRepository.unenrollStudent(courseId, studentId);
    }
}
