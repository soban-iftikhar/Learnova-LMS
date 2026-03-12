package lms.learnova.Controller;

import lms.learnova.DTOs.*;
import lms.learnova.Model.Student;
import lms.learnova.Service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/student")
public class StudentController {

    private final StudentService studentService;
    private final EnrollmentService enrollmentService;
    private final CourseContentService contentService;
    private final QuizService quizService;
    private final AttendanceService attendanceService;
    private final CourseService courseService;

    public StudentController(StudentService studentService, EnrollmentService enrollmentService,
                            CourseContentService contentService, QuizService quizService,
                            AttendanceService attendanceService, CourseService courseService) {
        this.studentService = studentService;
        this.enrollmentService = enrollmentService;
        this.contentService = contentService;
        this.quizService = quizService;
        this.attendanceService = attendanceService;
        this.courseService = courseService;
    }

    @GetMapping("/getStudents")
    public List<Student> getStudents() {
        return studentService.getStudents();
    }

    @GetMapping("/searchStudent/{id}")
    public Student getStudentById(@PathVariable Long id) {
        return studentService.getStudentById(id);
    }

    @PostMapping("/registerStudent")
    public ResponseEntity<Student> addStudent(@RequestBody Student student) {
        Student savedStudent = studentService.addStudent(student);
        return ResponseEntity.ok(savedStudent);
    }

    @PutMapping("/updateStudent/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student student) {
        Student updated = studentService.updateStudent(id, student);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/deleteStudent/{id}")
    public ResponseEntity<String> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok("Student deleted successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginStudent(@RequestBody Student student) {
        String loggedInStudent = studentService.verify(student);
        return ResponseEntity.ok(loggedInStudent);
    }

    // ===== ENROLLMENT ENDPOINTS =====

    @GetMapping("/enrollments")
    public ResponseEntity<List<EnrollmentDTO>> getStudentEnrollments(@RequestParam Long studentId) {
        List<lms.learnova.Model.Enrollment> enrollments = enrollmentService.getEnrollmentsByStudent(studentId);
        List<EnrollmentDTO> dtos = enrollments.stream().map(e -> {
            EnrollmentDTO dto = new EnrollmentDTO();
            dto.setId(e.getId());
            dto.setStudentId(e.getStudent().getId());
            dto.setCourseId(e.getCourse().getId());
            dto.setEnrollmentDate(e.getEnrollmentDate());
            dto.setStatus(e.getStatus());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/enroll")
    public ResponseEntity<EnrollmentDTO> enrollInCourse(@RequestBody EnrollmentDTO enrollmentDTO) {
        lms.learnova.Model.Enrollment enrolled = enrollmentService.enrollStudent(enrollmentDTO);
        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setId(enrolled.getId());
        dto.setStudentId(enrolled.getStudent().getId());
        dto.setCourseId(enrolled.getCourse().getId());
        dto.setEnrollmentDate(enrolled.getEnrollmentDate());
        dto.setStatus(enrolled.getStatus());
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/unenroll/{enrollmentId}")
    public ResponseEntity<String> unenrollFromCourse(@PathVariable Long enrollmentId,
                                                     @RequestParam Long courseId) {
        enrollmentService.unrollStudent(enrollmentId, courseId);
        return ResponseEntity.ok("Successfully unenrolled from course");
    }

    // ===== COURSE CONTENT ENDPOINTS =====

    @GetMapping("/courses/{courseId}/content")
    public ResponseEntity<List<CourseContentDTO>> getCourseMaterials(@PathVariable Long courseId) {
        List<CourseContentDTO> materials = contentService.getCourseMaterialsAsDTO(courseId);
        return ResponseEntity.ok(materials);
    }

    @GetMapping("/content/{contentId}")
    public ResponseEntity<CourseContentDTO> getContent(@PathVariable Long contentId) {
        CourseContentDTO dto = contentService.convertToDTO(contentService.getContentById(contentId));
        return ResponseEntity.ok(dto);
    }

    // ===== QUIZ ENDPOINTS =====

    @GetMapping("/courses/{courseId}/quizzes")
    public ResponseEntity<List<QuizDTO>> getCourseQuizzes(@PathVariable Long courseId) {
        var quizzes = quizService.getQuizzesByCourse(courseId).stream()
                .map(this::convertQuizToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<QuizDTO> getQuizDetails(@PathVariable Long quizId) {
        var quiz = quizService.getQuizWithQuestions(quizId);
        return ResponseEntity.ok(convertQuizToDTO(quiz));
    }

    @GetMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<List<QuizQuestionDTO>> getQuizQuestions(@PathVariable Long quizId) {
        var questions = quizService.getQuizQuestions(quizId).stream()
                .map(this::convertQuestionToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<QuizResultDTO> submitQuiz(@PathVariable Long quizId,
                                                    @RequestParam Long studentId,
                                                    @RequestBody List<StudentAnswerDTO> answers) {
        QuizResultDTO result = quizService.submitQuizAnswers(studentId, quizId, answers);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/quizzes/{quizId}/result")
    public ResponseEntity<QuizResultDTO> getQuizResult(@PathVariable Long quizId,
                                                       @RequestParam Long studentId) {
        QuizResultDTO result = quizService.getStudentQuizResult(studentId, quizId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/courses/{courseId}/results")
    public ResponseEntity<List<QuizResultDTO>> getCourseResults(@PathVariable Long courseId,
                                                                @RequestParam Long studentId) {
        List<QuizResultDTO> results = quizService.getStudentQuizResultsByCourse(studentId, courseId);
        return ResponseEntity.ok(results);
    }

    // ===== ATTENDANCE ENDPOINTS =====

    @GetMapping("/courses/{courseId}/attendance")
    public ResponseEntity<AttendanceRecordDTO> getCourseAttendance(@PathVariable Long courseId,
                                                                   @RequestParam Long studentId) {
        List<lms.learnova.Model.Enrollment> enrollments = enrollmentService.getEnrollmentsByStudent(studentId);
        lms.learnova.Model.Enrollment enrollment = enrollments.stream()
                .filter(e -> e.getCourse().getId().equals(courseId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));

        List<AttendanceDTO> records = attendanceService.getAttendanceByEnrollmentAsDTO(enrollment.getId());
        double percentage = attendanceService.getAttendancePercentage(enrollment.getId());

        AttendanceRecordDTO dto = new AttendanceRecordDTO();
        dto.setCourseId(courseId);
        dto.setAttendancePercentage(percentage);
        dto.setAttendanceRecords(records);

        return ResponseEntity.ok(dto);
    }

    // ===== STUDENT PROFILE ENDPOINTS =====

    @GetMapping("/profile/{studentId}")
    public ResponseEntity<StudentDTO> getStudentProfile(@PathVariable Long studentId) {
        Student student = studentService.getStudentById(studentId);
        StudentDTO dto = convertStudentToDTO(student);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile/{studentId}")
    public ResponseEntity<StudentDTO> updateStudentProfile(@PathVariable Long studentId,
                                                          @RequestBody StudentDTO studentDTO) {
        Student student = studentService.updateStudent(studentId, new Student());
        StudentDTO dto = convertStudentToDTO(student);
        return ResponseEntity.ok(dto);
    }

    // ===== HELPER METHODS =====

    private QuizDTO convertQuizToDTO(lms.learnova.Model.Quiz quiz) {
        QuizDTO dto = new QuizDTO();
        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setDescription(quiz.getDescription());
        dto.setMaxScore(quiz.getMaxScore());
        dto.setTimeLimitSeconds(quiz.getTimeLimitSeconds());
        dto.setStartTime(quiz.getStartTime());
        dto.setEndTime(quiz.getEndTime());
        dto.setIsPublished(quiz.getIsPublished());
        dto.setQuestionCount(quiz.getQuestions().size());
        return dto;
    }

    private QuizQuestionDTO convertQuestionToDTO(lms.learnova.Model.QuizQuestion question) {
        QuizQuestionDTO dto = new QuizQuestionDTO();
        dto.setId(question.getId());
        dto.setQuestionText(question.getQuestionText());
        dto.setOptionA(question.getOptionA());
        dto.setOptionB(question.getOptionB());
        dto.setOptionC(question.getOptionC());
        dto.setOptionD(question.getOptionD());
        dto.setMarks(question.getMarks());
        dto.setQuestionOrder(question.getQuestionOrder());
        return dto;
    }

    private StudentDTO convertStudentToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        dto.setRegistrationNumber(student.getRegistrationNumber());
        dto.setDegreeProgram(student.getDegreeProgram());
        if (student.getProfile() != null) {
            UserProfileDTO profileDTO = new UserProfileDTO();
            profileDTO.setId(student.getProfile().getId());
            profileDTO.setBio(student.getProfile().getBio());
            profileDTO.setPhoneNumber(student.getProfile().getPhoneNumber());
            profileDTO.setDateOfBirth(student.getProfile().getDateOfBirth());
            profileDTO.setProfilePicturePath(student.getProfile().getProfilePicturePath());
            profileDTO.setAddress(student.getProfile().getAddress());
            profileDTO.setCity(student.getProfile().getCity());
            profileDTO.setCountry(student.getProfile().getCountry());
            dto.setProfile(profileDTO);
        }
        return dto;
    }
}
