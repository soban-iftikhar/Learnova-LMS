package lms.learnova.Controller;

import lms.learnova.DTOs.*;
import lms.learnova.Model.Course;
import lms.learnova.Model.Instructor;
import lms.learnova.Model.Student;
import lms.learnova.Service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ===== INSTRUCTOR MANAGEMENT =====

    @GetMapping("/instructors")
    public ResponseEntity<List<InstructorDTO>> getAllInstructors() {
        List<Instructor> instructors = adminService.getAllInstructors();
        List<InstructorDTO> dtos = instructors.stream()
                .map(this::convertInstructorToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/instructors/{instructorId}")
    public ResponseEntity<InstructorDTO> getInstructor(@PathVariable Long instructorId) {
        Instructor instructor = adminService.getInstructorById(instructorId);
        return ResponseEntity.ok(convertInstructorToDTO(instructor));
    }

    @GetMapping("/instructors/{instructorId}/statistics")
    public ResponseEntity<InstructorStatsDTO> getInstructorStatistics(@PathVariable Long instructorId) {
        InstructorStatsDTO stats = adminService.getInstructorStatistics(instructorId);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/instructors/{instructorId}/deactivate")
    public ResponseEntity<String> deactivateInstructor(@PathVariable Long instructorId) {
        adminService.deactivateInstructor(instructorId);
        return ResponseEntity.ok("Instructor deactivated successfully");
    }

    // ===== STUDENT MANAGEMENT =====

    @GetMapping("/students")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        List<Student> students = adminService.getAllStudents();
        List<StudentDTO> dtos = students.stream()
                .map(this::convertStudentToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<StudentDTO> getStudent(@PathVariable Long studentId) {
        Student student = adminService.getStudentById(studentId);
        return ResponseEntity.ok(convertStudentToDTO(student));
    }

    @GetMapping("/students/{studentId}/statistics")
    public ResponseEntity<StudentStatsDTO> getStudentStatistics(@PathVariable Long studentId) {
        StudentStatsDTO stats = adminService.getStudentStatistics(studentId);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/students/{studentId}/suspend")
    public ResponseEntity<String> suspendStudent(@PathVariable Long studentId) {
        adminService.suspendStudent(studentId);
        return ResponseEntity.ok("Student suspended successfully");
    }

    @PostMapping("/students/{studentId}/reactivate")
    public ResponseEntity<String> reactivateStudent(@PathVariable Long studentId) {
        adminService.reactivateStudent(studentId);
        return ResponseEntity.ok("Student reactivated successfully");
    }

    // ===== COURSE ASSIGNMENT =====

    @PostMapping("/courses/{courseId}/assign-instructor/{instructorId}")
    public ResponseEntity<CourseDTO> assignCourseToInstructor(@PathVariable Long courseId,
                                                              @PathVariable Long instructorId) {
        Course course = adminService.assignCourseToInstructor(courseId, instructorId);
        return ResponseEntity.ok(convertCourseToDTO(course));
    }

    @PostMapping("/courses/{courseId}/reassign-instructor/{newInstructorId}")
    public ResponseEntity<CourseDTO> reassignCourse(@PathVariable Long courseId,
                                                    @PathVariable Long newInstructorId) {
        Course course = adminService.reassignCourse(courseId, newInstructorId);
        return ResponseEntity.ok(convertCourseToDTO(course));
    }

    @GetMapping("/courses/unassigned")
    public ResponseEntity<List<CourseDTO>> getUnassignedCourses() {
        List<Course> courses = adminService.getUnassignedCourses();
        List<CourseDTO> dtos = courses.stream()
                .map(this::convertCourseToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ===== ANALYTICS & REPORTING =====

    @GetMapping("/analytics/system-statistics")
    public ResponseEntity<SystemStatsDTO> getSystemStatistics() {
        SystemStatsDTO stats = adminService.getSystemStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics/courses/{courseId}/statistics")
    public ResponseEntity<CourseStatsDTO> getCourseStatistics(@PathVariable Long courseId) {
        CourseStatsDTO stats = adminService.getCourseStatistics(courseId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics/category-statistics")
    public ResponseEntity<List<CategoryStatsDTO>> getCategoryStatistics() {
        List<CategoryStatsDTO> stats = adminService.getCategoryStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics/top-students")
    public ResponseEntity<List<StudentStatsDTO>> getTopPerformingStudents(@RequestParam(defaultValue = "10") int limit) {
        List<StudentStatsDTO> students = adminService.getTopPerformingStudents(limit);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/analytics/top-courses")
    public ResponseEntity<List<CourseStatsDTO>> getTopCoursesByEnrollment(@RequestParam(defaultValue = "10") int limit) {
        List<CourseStatsDTO> courses = adminService.getTopCoursesByEnrollment(limit);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/analytics/engagement-report")
    public ResponseEntity<EngagementReportDTO> getEngagementReport() {
        EngagementReportDTO report = adminService.getEngagementReport();
        return ResponseEntity.ok(report);
    }

    // ===== USER MANAGEMENT =====

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsersWithRoles() {
        List<UserDTO> users = adminService.getAllUsersWithRoles();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/by-role/{role}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String role) {
        List<UserDTO> users = adminService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    // ===== HELPER METHODS =====

    private InstructorDTO convertInstructorToDTO(Instructor instructor) {
        InstructorDTO dto = new InstructorDTO();
        dto.setId(instructor.getId());
        dto.setName(instructor.getName());
        dto.setEmail(instructor.getEmail());
        dto.setQualification(instructor.getQualification() != null ? instructor.getQualification().toString() : null);
        dto.setExperience(instructor.getExperience());
        return dto;
    }

    private StudentDTO convertStudentToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        dto.setRegistrationNumber(student.getRegistrationNumber());
        dto.setDegreeProgram(student.getDegreeProgram());
        return dto;
    }

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
}
