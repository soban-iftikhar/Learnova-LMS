package lms.learnova.Service;

import lms.learnova.DTOs.*;
import lms.learnova.Enum.Role;
import lms.learnova.Model.*;
import lms.learnova.Repository.*;
import lms.learnova.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final InstructorRepo instructorRepo;
    private final StudentRepo studentRepo;
    private final CourseRepo courseRepo;
    private final UserRepo userRepo;
    private final EnrollmentRepo enrollmentRepo;
    private final StudentAnswerRepo studentAnswerRepo;

    public AdminService(InstructorRepo instructorRepo, StudentRepo studentRepo, CourseRepo courseRepo,
                       UserRepo userRepo, EnrollmentRepo enrollmentRepo, StudentAnswerRepo studentAnswerRepo) {
        this.instructorRepo = instructorRepo;
        this.studentRepo = studentRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.studentAnswerRepo = studentAnswerRepo;
    }

    // ===== INSTRUCTOR MANAGEMENT =====

    // Get all instructors
    public List<Instructor> getAllInstructors() {
        return instructorRepo.findAll();
    }

    // Get instructor by ID
    public Instructor getInstructorById(Long instructorId) {
        return instructorRepo.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
    }

    // Get instructor statistics
    public InstructorStatsDTO getInstructorStatistics(Long instructorId) {
        Instructor instructor = getInstructorById(instructorId);
        List<Course> courses = courseRepo.findByInstructorId(instructorId);

        int totalCourses = courses.size();
        int totalStudents = courses.stream()
                .mapToInt(c -> c.getEnrollments().size())
                .sum();

        InstructorStatsDTO stats = new InstructorStatsDTO();
        stats.setInstructorId(instructorId);
        stats.setInstructorName(instructor.getName());
        stats.setTotalCourses(totalCourses);
        stats.setTotalStudents(totalStudents);
        stats.setQualification(instructor.getQualification() != null ? instructor.getQualification().toString() : null);
        stats.setExperience(instructor.getExperience());

        return stats;
    }

    // Deactivate instructor
    @Transactional
    public void deactivateInstructor(Long instructorId) {
        Instructor instructor = getInstructorById(instructorId);
        // Reassign all courses to null (unassign from instructor)
        List<Course> courses = courseRepo.findByInstructorId(instructorId);
        courses.forEach(course -> {
            course.setInstructor(null);
        });
        courseRepo.saveAll(courses);
    }

    // ===== STUDENT MANAGEMENT =====

    // Get all students
    public List<Student> getAllStudents() {
        return studentRepo.findAll();
    }

    // Get student by ID
    public Student getStudentById(Long studentId) {
        return studentRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    // Get student statistics
    public StudentStatsDTO getStudentStatistics(Long studentId) {
        Student student = getStudentById(studentId);
        List<Enrollment> enrollments = enrollmentRepo.findByStudentId(studentId);

        int totalCourses = enrollments.size();
        int completedCourses = (int) enrollments.stream()
                .filter(e -> "COMPLETED".equals(e.getStatus()))
                .count();

        // Calculate average score
        List<StudentAnswer> answers = studentAnswerRepo.findByStudentId(studentId);
        double averageScore = answers.isEmpty() ? 0.0 : 
                answers.stream().mapToInt(StudentAnswer::getMarksObtained).average().orElse(0.0);

        StudentStatsDTO stats = new StudentStatsDTO();
        stats.setStudentId(studentId);
        stats.setStudentName(student.getName());
        stats.setEmail(student.getEmail());
        stats.setRegistrationNumber(student.getRegistrationNumber());
        stats.setDegreeProgram(student.getDegreeProgram());
        stats.setEnrolledCourses(totalCourses);
        stats.setCompletedCourses(completedCourses);
        stats.setAverageScore(averageScore);

        return stats;
    }

    // Suspend student
    @Transactional
    public void suspendStudent(Long studentId) {
        Student student = getStudentById(studentId);
        List<Enrollment> enrollments = enrollmentRepo.findByStudentId(studentId);
        enrollments.forEach(e -> e.setStatus("SUSPENDED"));
        enrollmentRepo.saveAll(enrollments);
    }

    // Reactivate student
    @Transactional
    public void reactivateStudent(Long studentId) {
        Student student = getStudentById(studentId);
        List<Enrollment> enrollments = enrollmentRepo.findByStudentId(studentId);
        enrollments.forEach(e -> {
            if ("SUSPENDED".equals(e.getStatus())) {
                e.setStatus("ACTIVE");
            }
        });
        enrollmentRepo.saveAll(enrollments);
    }

    // ===== COURSE ASSIGNMENT =====

    // Assign course to instructor
    @Transactional
    public Course assignCourseToInstructor(Long courseId, Long instructorId) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        Instructor instructor = getInstructorById(instructorId);

        course.setInstructor(instructor);
        return courseRepo.save(course);
    }

    // Reassign course to different instructor
    @Transactional
    public Course reassignCourse(Long courseId, Long newInstructorId) {
        return assignCourseToInstructor(courseId, newInstructorId);
    }

    // Get unassigned courses
    public List<Course> getUnassignedCourses() {
        return courseRepo.findByInstructorIsNull();
    }

    // ===== ANALYTICS & REPORTING =====

    // Get system statistics
    public SystemStatsDTO getSystemStatistics() {
        List<Instructor> instructors = getAllInstructors();
        List<Student> students = getAllStudents();
        List<Course> courses = courseRepo.findAll();
        List<Enrollment> enrollments = enrollmentRepo.findAll();

        int totalUsers = instructors.size() + students.size();
        int totalCourses = courses.size();
        int totalEnrollments = enrollments.size();

        SystemStatsDTO stats = new SystemStatsDTO();
        stats.setTotalInstructors(instructors.size());
        stats.setTotalStudents(students.size());
        stats.setTotalUsers(totalUsers);
        stats.setTotalCourses(totalCourses);
        stats.setTotalEnrollments(totalEnrollments);
        stats.setActiveEnrollments((int) enrollments.stream().filter(e -> "ACTIVE".equals(e.getStatus())).count());
        stats.setCompletedEnrollments((int) enrollments.stream().filter(e -> "COMPLETED".equals(e.getStatus())).count());

        return stats;
    }

    // Get course statistics
    public CourseStatsDTO getCourseStatistics(Long courseId) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        List<Enrollment> enrollments = enrollmentRepo.findByCourseId(courseId);

        CourseStatsDTO stats = new CourseStatsDTO();
        stats.setCourseId(courseId);
        stats.setCourseTitle(course.getTitle());
        stats.setInstructorName(course.getInstructor().getName());
        stats.setTotalEnrollments(enrollments.size());
        stats.setActiveEnrollments((int) enrollments.stream().filter(e -> "ACTIVE".equals(e.getStatus())).count());
        stats.setCompletedEnrollments((int) enrollments.stream().filter(e -> "COMPLETED".equals(e.getStatus())).count());
        stats.setDropoutCount((int) enrollments.stream().filter(e -> "DROPPED".equals(e.getStatus())).count());
        stats.setCreatedAt(course.getCreatedAt());

        return stats;
    }

    // Get enrollment trend (courses by category)
    public List<CategoryStatsDTO> getCategoryStatistics() {
        List<Course> courses = courseRepo.findAll();
        return courses.stream()
                .collect(Collectors.groupingBy(Course::getCategory))
                .entrySet().stream()
                .map(entry -> {
                    CategoryStatsDTO stat = new CategoryStatsDTO();
                    stat.setCategory(entry.getKey());
                    stat.setCourseCount(entry.getValue().size());
                    stat.setTotalEnrollments(entry.getValue().stream()
                            .mapToInt(c -> c.getEnrollments().size())
                            .sum());
                    return stat;
                })
                .collect(Collectors.toList());
    }

    // Get top performing students
    public List<StudentStatsDTO> getTopPerformingStudents(int limit) {
        return getAllStudents().stream()
                .map(s -> getStudentStatistics(s.getId()))
                .sorted((a, b) -> Double.compare(b.getAverageScore(), a.getAverageScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    // Get top courses by enrollment
    public List<CourseStatsDTO> getTopCoursesByEnrollment(int limit) {
        return courseRepo.findAll().stream()
                .map(course -> getCourseStatistics(course.getId()))
                .sorted((a, b) -> Integer.compare(b.getTotalEnrollments(), a.getTotalEnrollments()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    // Get engagement report
    public EngagementReportDTO getEngagementReport() {
        List<Student> students = getAllStudents();
        List<Enrollment> allEnrollments = enrollmentRepo.findAll();

        int activeStudents = (int) students.stream()
                .filter(s -> enrollmentRepo.findByStudentId(s.getId()).stream()
                        .anyMatch(e -> "ACTIVE".equals(e.getStatus())))
                .count();

        int completedStudents = (int) students.stream()
                .filter(s -> enrollmentRepo.findByStudentId(s.getId()).stream()
                        .anyMatch(e -> "COMPLETED".equals(e.getStatus())))
                .count();

        EngagementReportDTO report = new EngagementReportDTO();
        report.setTotalStudents(students.size());
        report.setActiveStudents(activeStudents);
        report.setInactiveStudents(students.size() - activeStudents);
        report.setCompletedCoursesCount(completedStudents);
        report.setEnrollmentRate((double) (activeStudents * 100) / students.size());
        report.setCompletionRate((double) (completedStudents * 100) / students.size());

        return report;
    }

    // ===== USER MANAGEMENT =====

    // Get all users with roles
    public List<UserDTO> getAllUsersWithRoles() {
        return userRepo.findAll().stream()
                .map(this::convertUserToDTO)
                .collect(Collectors.toList());
    }

    // Get users by role
    public List<UserDTO> getUsersByRole(String role) {
        return userRepo.findByRole(Role.valueOf(role)).stream()
                .map(this::convertUserToDTO)
                .collect(Collectors.toList());
    }

    // ===== HELPER METHODS =====

    private UserDTO convertUserToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().toString());
        return dto;
    }
}
