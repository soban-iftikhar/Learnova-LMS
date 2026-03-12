package lms.learnova.Controller;


import lms.learnova.DTOs.EnrollmentDTO;
import lms.learnova.Model.Enrollment;
import lms.learnova.Service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/enrollment")
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }


    @PostMapping("/enroll")
    public ResponseEntity<Enrollment> enrollStudent(@RequestBody EnrollmentDTO dto) {
        return ResponseEntity.ok(enrollmentService.enrollStudent(dto));
    }

    @DeleteMapping({"/unroll/{studentId}/{courseId}", "/unenroll/{studentId}/{courseId}"})
    public ResponseEntity<Void> unroll(
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