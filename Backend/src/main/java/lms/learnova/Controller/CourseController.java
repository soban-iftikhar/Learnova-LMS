package lms.learnova.Controller;

import lms.learnova.Model.Course;
import lms.learnova.Model.Instructor;
import lms.learnova.Service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
public class CourseController {

    private final CourseService courseService;

    @Autowired
    public CourseController(CourseService courseService){
     this.courseService = courseService;
    }

    @GetMapping("/getAllCourses")
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @GetMapping("searchCourseById/{id}")
    public Course getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id);
    }

    @GetMapping("/searchCourseByTitle/{title}")
    public Course searchCourseByTitle(@PathVariable String title) {
        return courseService.searchCourseByTitle(title);
    }

    @GetMapping("/searchCoursesByCategory{category}")
    public List<Course> searchCourseByCategory(@PathVariable String category) {
        return courseService.searchCourseByCategory(category);
    }


    @PostMapping("/addCourse")
    public ResponseEntity<?> addCourse(@RequestBody Course course) {
        try {
            Course savedCourse = courseService.addCourse(course);
            return ResponseEntity.ok(savedCourse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/updateInstructor/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody Course course) {
        try {
            Course updated = courseService.updateCourse(id, course);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/deleteCourse/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok("Course deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/getCoursesByInstructor/{instructorId}")
    public List<Course> getCoursesByInstructor(@PathVariable Long instructorId) {
        return courseService.getCoursesByInstructor(instructorId);
    }


    @GetMapping("getEnrolledStudents/{courseId}")
    public List<String> getEnrolledStudents(@PathVariable Long courseId) {
        return courseService.getEnrolledStudents(courseId);
    }

    @PostMapping("enrollStudent/{courseId}/{studentId}")
    public ResponseEntity<?> enrollStudent(@PathVariable Long courseId, @PathVariable Long studentId) {
        try {
            courseService.enrollStudent(courseId, studentId);
            return ResponseEntity.ok("Student enrolled successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("unrollStudent/{courseId}/{studentId}")
    public ResponseEntity<?> unrollStudent(@PathVariable Long courseId, @PathVariable Long studentId) {
        try {
            courseService.unrollStudent(courseId, studentId);
            return ResponseEntity.ok("Student unrolled successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }
}
