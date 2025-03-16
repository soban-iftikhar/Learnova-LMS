package lms.learnova.Controller;

import lms.learnova.Model.Course;
import lms.learnova.Service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    /**
     * Retrieves a list of all available courses.
     * @return List of all courses.
     */
    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    /**
     * Retrieves a specific course by its ID.
     * @param id The ID of the course.
     * @return The course with the given ID.
     */
    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id);
    }

    /**
     * Searches for a course by its title.
     * @param title The title of the course.
     * @return The course that matches the title.
     */
    @GetMapping("/search/{title}")
    public Course searchCourseByTitle(@PathVariable String title) {
        return courseService.searchCourseByTitle(title);
    }

    /**
     * Searches for courses by category.
     * @param category The category of the course.
     * @return List of courses in the given category.
     */
    @GetMapping("/search/category/{category}")
    public List<Course> searchCourseByCategory(@PathVariable String category) {
        return courseService.searchCourseByCategory(category);
    }

    /**
     * Adds a new course to the system.
     * @param course The course object to be added.
     * @return The added course or an error message.
     */
    @PostMapping("/add")
    public ResponseEntity<?> addCourse(@RequestBody Course course) {
        try {
            Course savedCourse = courseService.addCourse(course);
            return ResponseEntity.ok(savedCourse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    /**
     * Updates an existing course.
     * @param id The ID of the course to update.
     * @param course The updated course details.
     * @return The updated course.
     */
    @PutMapping("/update/{id}")
    public Course updateCourse(@PathVariable Long id, @RequestBody Course course) {
        return courseService.updateCourse(id, course);
    }

    /**
     * Deletes a course by its ID.
     * @param id The ID of the course to delete.
     * @return A success message if deleted, or an error message if failed.
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok("Course deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    /**
     * Retrieves all courses taught by a specific instructor.
     * @param instructorId The ID of the instructor.
     * @return List of courses taught by the instructor.
     */
    @GetMapping("/instructor/{instructorId}")
    public List<Course> getCoursesByInstructor(@PathVariable Long instructorId) {
        return courseService.getCoursesByInstructor(instructorId);
    }

    /**
     * Retrieves all students enrolled in a specific course.
     * @param courseId The ID of the course.
     * @return List of students enrolled in the course.
     */
    @GetMapping("/{courseId}/students")
    public List<String> getEnrolledStudents(@PathVariable Long courseId) {
        return courseService.getEnrolledStudents(courseId);
    }

    /**
     * Enrolls a student in a course.
     * @param courseId The ID of the course.
     * @param studentId The ID of the student.
     * @return A success message.
     */
    @PostMapping("/{courseId}/enroll/{studentId}")
    public ResponseEntity<?> enrollStudent(@PathVariable Long courseId, @PathVariable Long studentId) {
        try {
            courseService.enrollStudent(courseId, studentId);
            return ResponseEntity.ok("Student enrolled successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    /**
     * Unenrolls a student from a course.
     * @param courseId The ID of the course.
     * @param studentId The ID of the student.
     * @return A success message.
     */
    @DeleteMapping("/{courseId}/unenroll/{studentId}")
    public ResponseEntity<?> unenrollStudent(@PathVariable Long courseId, @PathVariable Long studentId) {
        try {
            courseService.unenrollStudent(courseId, studentId);
            return ResponseEntity.ok("Student unenrolled successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }
}
