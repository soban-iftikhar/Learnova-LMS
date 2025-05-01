package lms.learnova.Service;

import jakarta.transaction.Transactional;
import lms.learnova.Model.*;
import lms.learnova.Repository.EnrollmentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EnrollmentService {
    private final EnrollmentRepo enrollmentRepo;
    private final StudentService studentService;
    private final CourseService courseService;

    @Autowired
    public EnrollmentService(EnrollmentRepo enrollmentRepo, StudentService studentService, CourseService courseService) {
        this.enrollmentRepo = enrollmentRepo;
        this.studentService = studentService;
        this.courseService = courseService;
    }


    public Enrollment enrollStudent(Long studentId, Long courseId) {
        if (enrollmentRepo.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new RuntimeException("Student already enrolled in this course");
        }
        Student student = studentService.getStudentById(studentId);
        Course course = courseService.getCourseById(courseId);

        return enrollmentRepo.save(new Enrollment(student, course));
    }


    public void unrollStudent(Long studentId, Long courseId) {
        Enrollment enrollment = enrollmentRepo.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        enrollment.setActive(false);
        enrollmentRepo.save(enrollment);
    }

    public List<Enrollment> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepo.findByStudentId(studentId);
    }

    public List<Enrollment> getEnrollmentsByCourse(Long courseId) {
        return enrollmentRepo.findByCourseId(courseId);
    }

    public Enrollment save(Enrollment enrollment) {
        return enrollmentRepo.save(enrollment);
    }


    public void deleteEnrollment(Long studentId, Long courseId) {
        enrollmentRepo.findByStudentIdAndCourseId(studentId, courseId)
                .ifPresent(enrollment -> {
                    enrollment.setActive(false);
                    enrollmentRepo.save(enrollment);
                });
    }
}