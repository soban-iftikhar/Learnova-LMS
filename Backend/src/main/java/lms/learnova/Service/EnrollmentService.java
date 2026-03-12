package lms.learnova.Service;

import lms.learnova.DTOs.EnrollmentDTO;
import lms.learnova.exception.ResourceConflictException;
import lms.learnova.exception.ResourceNotFoundException;
import lms.learnova.Model.*;
import lms.learnova.Repository.EnrollmentRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnrollmentService {
    private final EnrollmentRepo enrollmentRepo;
    private final StudentService studentService;
    private final CourseService courseService;

    public EnrollmentService(EnrollmentRepo enrollmentRepo, StudentService studentService, CourseService courseService) {
        this.enrollmentRepo = enrollmentRepo;
        this.studentService = studentService;
        this.courseService = courseService;
    }


    public Enrollment enrollStudent(Long studentId, Long courseId) {
        if (enrollmentRepo.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new ResourceConflictException("Student already enrolled in this course");
        }
        Student student = studentService.getStudentById(studentId);
        Course course = courseService.getCourseById(courseId);

        return enrollmentRepo.save(new Enrollment(student, course));
    }

    public Enrollment enrollStudent(EnrollmentDTO dto) {
        Enrollment enrollment = enrollStudent(dto.getStudentId(), dto.getCourseId());

        enrollment.setActive(dto.isActive());
        if (dto.getEnrollmentDate() != null) {
            enrollment.setEnrollmentDate(dto.getEnrollmentDate());
        }

        return enrollmentRepo.save(enrollment);
    }


    public void unrollStudent(Long studentId, Long courseId) {
        Enrollment enrollment = enrollmentRepo.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
        enrollment.setActive(false);
        enrollmentRepo.save(enrollment);
    }

    public List<Enrollment> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepo.findByStudentId(studentId);
    }

    public List<Enrollment> getEnrollmentsByCourse(Long courseId) {
        return enrollmentRepo.findByCourseId(courseId);
    }


    public void deleteEnrollment(Long studentId, Long courseId) {
        Enrollment enrollment = enrollmentRepo.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
        enrollment.setActive(false);
        enrollmentRepo.save(enrollment);
    }
}