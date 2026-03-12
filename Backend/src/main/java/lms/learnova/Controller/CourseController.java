package lms.learnova.Controller;

import lms.learnova.DTOs.*;
import lms.learnova.Model.Course;
import lms.learnova.Service.CourseContentService;
import lms.learnova.Service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/course")
public class CourseController {

    private final CourseService courseService;
    private final CourseContentService contentService;

    public CourseController(CourseService courseService, CourseContentService contentService){
        this.courseService = courseService;
        this.contentService = contentService;
    }

    @GetMapping("/getAllCourses")
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        List<CourseDTO> courses = courseService.getAllCourses().stream()
                .map(this::convertCourseToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/searchCourseById/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        Course course = courseService.getCourseById(id);
        return ResponseEntity.ok(convertCourseToDTO(course));
    }

    @GetMapping("/searchCourseByTitle/{title}")
    public ResponseEntity<CourseDTO> searchCourseByTitle(@PathVariable String title) {
        Course course = courseService.searchCourseByTitle(title);
        return ResponseEntity.ok(convertCourseToDTO(course));
    }

    @GetMapping("/search")
    public ResponseEntity<List<CourseDTO>> searchCourses(@RequestParam String query) {
        List<CourseDTO> courses = courseService.getAllCourses().stream()
                .filter(course -> course.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                                 course.getDescription().toLowerCase().contains(query.toLowerCase()) ||
                                 course.getCategory().toLowerCase().contains(query.toLowerCase()))
                .map(this::convertCourseToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/addCourse")
    public ResponseEntity<CourseDTO> addCourse(@RequestBody CreateCourseRequest request) {
        Course savedCourse = courseService.addCourse(request);
        return ResponseEntity.ok(convertCourseToDTO(savedCourse));
    }

    @PutMapping("/updateCourse/{id}")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @RequestBody UpdateCourseRequest request) {
        Course updated = courseService.updateCourse(id, request);
        return ResponseEntity.ok(convertCourseToDTO(updated));
    }

    @DeleteMapping("/deleteCourse/{id}")
    public ResponseEntity<String> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok("Course deleted successfully");
    }

    // ===== COURSE CONTENT ENDPOINTS =====

    @GetMapping("/{courseId}/content")
    public ResponseEntity<List<CourseContentDTO>> getCourseMaterials(@PathVariable Long courseId) {
        List<CourseContentDTO> materials = contentService.getCourseMaterialsAsDTO(courseId);
        return ResponseEntity.ok(materials);
    }

    @GetMapping("/{courseId}/details")
    public ResponseEntity<CourseDetailsDTO> getCourseDetails(@PathVariable Long courseId) {
        Course course = courseService.getCourseById(courseId);
        List<CourseContentDTO> materials = contentService.getCourseMaterialsAsDTO(courseId);

        CourseDetailsDTO dto = new CourseDetailsDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setCategory(course.getCategory());
        dto.setInstructor(convertInstructorToDTO(course.getInstructor()));
        dto.setEnrolledCount((long) course.getEnrollments().size());
        dto.setCreatedAt(course.getCreatedAt());
        dto.setMaterials(materials);

        return ResponseEntity.ok(dto);
    }

    // ===== HELPER METHODS =====

    private CourseDTO convertCourseToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setCategory(course.getCategory());
        if (course.getInstructor() != null) {
            dto.setInstructor(convertInstructorToDTO(course.getInstructor()));
        }
        dto.setEnrolledCount(course.getEnrollments().size());
        dto.setCreatedAt(course.getCreatedAt());
        return dto;
    }

    private InstructorDTO convertInstructorToDTO(lms.learnova.Model.Instructor instructor) {
        InstructorDTO dto = new InstructorDTO();
        dto.setId(instructor.getId());
        dto.setName(instructor.getName());
        dto.setEmail(instructor.getEmail());
        dto.setQualification(instructor.getQualification() != null ? instructor.getQualification().toString() : null);
        dto.setExperience(instructor.getExperience());
        return dto;
    }

}
