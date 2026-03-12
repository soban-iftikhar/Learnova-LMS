package lms.learnova.Controller;

import lms.learnova.DTOs.CreateCourseRequest;
import lms.learnova.DTOs.UpdateCourseRequest;
import lms.learnova.Model.Course;
import lms.learnova.Service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/course")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService){
     this.courseService = courseService;
    }

    @GetMapping("/getAllCourses")
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @GetMapping("/searchCourseById/{id}")
    public Course getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id);
    }

    @GetMapping("/searchCourseByTitle/{title}")
    public Course searchCourseByTitle(@PathVariable String title) {
        return courseService.searchCourseByTitle(title);
    }

    @PostMapping("/addCourse")
    public ResponseEntity<Course> addCourse(@RequestBody CreateCourseRequest request) {
        Course savedCourse = courseService.addCourse(request);
        return ResponseEntity.ok(savedCourse);
    }

    @PutMapping("/updateCourse/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody UpdateCourseRequest request) {
        Course updated = courseService.updateCourse(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/deleteCourse/{id}")
    public ResponseEntity<String> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok("Course deleted successfully");
    }

}
