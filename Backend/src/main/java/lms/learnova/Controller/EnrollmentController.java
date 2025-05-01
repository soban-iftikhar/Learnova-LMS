package lms.learnova.Controller;


import lms.learnova.DTOs.EnrollmentDTO;
import lms.learnova.Model.Enrollment;
import lms.learnova.Service.CourseService;
import lms.learnova.Service.EnrollmentService;
import lms.learnova.Service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/enrollments")
public class EnrollmentController {
    private final EnrollmentService enrollmentService;
    private final StudentService studentService;
    private final CourseService courseService;

    @Autowired
    public EnrollmentController(StudentService studentService, CourseService courseService, EnrollmentService enrollmentService) {
        this.studentService = studentService;
        this.courseService = courseService;
        this.enrollmentService = enrollmentService;
    }


    @PostMapping("/enroll")
    public ResponseEntity<Enrollment> enrollStudent(@RequestBody EnrollmentDTO dto) {
        Enrollment enrollment = new Enrollment(
                studentService.getStudentById(dto.getStudentId()),
                courseService.getCourseById(dto.getCourseId())
        );
        enrollment.setActive(dto.isActive());
        enrollment.setEnrollmentDate(dto.getEnrollmentDate());

        return ResponseEntity.ok(enrollmentService.save(enrollment));
    }

    @DeleteMapping("/students/{studentId}/courses/{courseId}")
    public ResponseEntity<Void> unenroll(
            @PathVariable Long studentId,
            @PathVariable Long courseId
    ) {
        enrollmentService.deleteEnrollment(studentId, courseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getStudentEnrollments(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(studentId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Enrollment>> getCourseEnrollments(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByCourse(courseId));
    }

}