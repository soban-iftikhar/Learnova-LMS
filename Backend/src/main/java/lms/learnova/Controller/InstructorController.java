package lms.learnova.Controller;

import lms.learnova.DTOs.*;
import lms.learnova.Model.*;
import lms.learnova.Service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/instructor")
public class InstructorController {

    private final InstructorService instructorService;
    private final CourseService courseService;
    private final CourseContentService contentService;
    private final QuizCreationService quizCreationService;
    private final AttendanceService attendanceService;
    private final EnrollmentService enrollmentService;

    public InstructorController(InstructorService instructorService, CourseService courseService,
                               CourseContentService contentService, QuizCreationService quizCreationService,
                               AttendanceService attendanceService, EnrollmentService enrollmentService) {
        this.instructorService = instructorService;
        this.courseService = courseService;
        this.contentService = contentService;
        this.quizCreationService = quizCreationService;
        this.attendanceService = attendanceService;
        this.enrollmentService = enrollmentService;
    }

    // ===== BASIC INSTRUCTOR OPERATIONS =====

    @GetMapping("/getInstructors")
    public List<Instructor> getInstructors() {
        return instructorService.getInstructors();
    }

    @GetMapping("/searchInstructor/{id}")
    public Instructor getInstructorById(@PathVariable Long id) {
        return instructorService.getInstructorById(id);
    }

    @PostMapping("/registerInstructor")
    public ResponseEntity<Instructor> addInstructor(@RequestBody Instructor instructor) {
        Instructor savedInstructor = instructorService.addInstructor(instructor);
        return ResponseEntity.ok(savedInstructor);
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginInstructor(@RequestBody Instructor instructor) {
        String loggedInInstructor = instructorService.verify(instructor);
        return ResponseEntity.ok(loggedInInstructor);
    }

    @PutMapping("/updateInstructor/{id}")
    public ResponseEntity<Instructor> updateInstructor(@PathVariable Long id, @RequestBody Instructor instructor) {
        Instructor updated = instructorService.updateInstructor(id, instructor);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/deleteInstructor/{id}")
    public ResponseEntity<String> deleteInstructor(@PathVariable Long id) {
        instructorService.deleteInstructor(id);
        return ResponseEntity.ok("Instructor deleted successfully");
    }

    // ===== COURSE MANAGEMENT =====

    @GetMapping("/courses")
    public ResponseEntity<List<CourseDTO>> getInstructorCourses(@RequestParam Long instructorId) {
        List<Course> courses = courseService.getAllCourses().stream()
                .filter(c -> c.getInstructor().getId().equals(instructorId))
                .collect(Collectors.toList());

        List<CourseDTO> dtos = courses.stream().map(this::convertCourseToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<CourseDetailsDTO> getCourseDetails(@PathVariable Long courseId,
                                                            @RequestParam Long instructorId) {
        Course course = courseService.getCourseById(courseId);
        
        if (!course.getInstructor().getId().equals(instructorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

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

    @PostMapping("/courses")
    public ResponseEntity<CourseDTO> createCourse(@RequestParam Long instructorId,
                                                  @RequestBody CreateCourseRequest request) {
        Course course = courseService.addCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertCourseToDTO(course));
    }

    @PutMapping("/courses/{courseId}")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long courseId,
                                                  @RequestParam Long instructorId,
                                                  @RequestBody UpdateCourseRequest request) {
        Course course = courseService.getCourseById(courseId);
        
        if (!course.getInstructor().getId().equals(instructorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Course updated = courseService.updateCourse(courseId, request);
        return ResponseEntity.ok(convertCourseToDTO(updated));
    }

    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<String> deleteCourse(@PathVariable Long courseId,
                                              @RequestParam Long instructorId) {
        Course course = courseService.getCourseById(courseId);
        
        if (!course.getInstructor().getId().equals(instructorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        courseService.deleteCourse(courseId);
        return ResponseEntity.ok("Course deleted successfully");
    }

    // ===== COURSE CONTENT MANAGEMENT =====

    @GetMapping("/courses/{courseId}/content")
    public ResponseEntity<List<CourseContentDTO>> getCourseMaterials(@PathVariable Long courseId,
                                                                    @RequestParam Long instructorId) {
        Course course = courseService.getCourseById(courseId);
        
        if (!course.getInstructor().getId().equals(instructorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<CourseContentDTO> materials = contentService.getCourseMaterialsAsDTO(courseId);
        return ResponseEntity.ok(materials);
    }

    @PostMapping("/courses/{courseId}/content/video")
    public ResponseEntity<CourseContentDTO> uploadVideo(@PathVariable Long courseId,
                                                       @RequestParam Long instructorId,
                                                       @RequestBody VideoUploadRequest request) {
        Course course = courseService.getCourseById(courseId);
        
        if (!course.getInstructor().getId().equals(instructorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Video video = new Video();
        video.setCourse(course);
        video.setTitle(request.getTitle());
        video.setDescription(request.getDescription());
        video.setVideoUrl(request.getVideoUrl());
        video.setDurationMinutes(request.getDurationMinutes());
        video.setThumbnailPath(request.getThumbnailPath());
        video.setFilePath(request.getVideoUrl());
        video.setFileSize(request.getFileSize());
        video.setIsPublished(request.getIsPublished() != null ? request.getIsPublished() : false);
        video.setOrderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0);

        CourseContentDTO dto = contentService.convertToDTO(video);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PostMapping("/courses/{courseId}/content/pdf")
    public ResponseEntity<CourseContentDTO> uploadPDF(@PathVariable Long courseId,
                                                     @RequestParam Long instructorId,
                                                     @RequestBody PDFUploadRequest request) {
        Course course = courseService.getCourseById(courseId);
        
        if (!course.getInstructor().getId().equals(instructorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        PDF pdf = new PDF();
        pdf.setCourse(course);
        pdf.setTitle(request.getTitle());
        pdf.setDescription(request.getDescription());
        pdf.setFilePath(request.getFilePath());
        pdf.setFileSize(request.getFileSize());
        pdf.setPageCount(request.getPageCount());
        pdf.setIsAssignment(request.getIsAssignment() != null ? request.getIsAssignment() : false);
        if (request.getDueDate() != null) {
            pdf.setDueDate(request.getDueDate().atStartOfDay());
        }
        pdf.setIsPublished(request.getIsPublished() != null ? request.getIsPublished() : false);
        pdf.setOrderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0);

        CourseContentDTO dto = contentService.convertToDTO(pdf);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    // ===== QUIZ MANAGEMENT =====

    @GetMapping("/courses/{courseId}/quizzes")
    public ResponseEntity<List<QuizDTO>> getCourseQuizzes(@PathVariable Long courseId,
                                                         @RequestParam Long instructorId) {
        List<Quiz> quizzes = quizCreationService.getQuizzesForCourse(courseId, instructorId);
        List<QuizDTO> dtos = quizzes.stream()
                .map(quizCreationService::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<QuizDTO> getQuiz(@PathVariable Long quizId,
                                           @RequestParam Long instructorId) {
        Quiz quiz = quizCreationService.getQuizForEditing(quizId, instructorId);
        return ResponseEntity.ok(quizCreationService.convertToDTO(quiz));
    }

    @PostMapping("/courses/{courseId}/quizzes")
    public ResponseEntity<QuizDTO> createQuiz(@PathVariable Long courseId,
                                             @RequestParam Long instructorId,
                                             @RequestBody QuizDTO quizDTO) {
        Quiz quiz = quizCreationService.createQuiz(courseId, instructorId, quizDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(quizCreationService.convertToDTO(quiz));
    }

    @PutMapping("/quizzes/{quizId}")
    public ResponseEntity<QuizDTO> updateQuiz(@PathVariable Long quizId,
                                             @RequestParam Long instructorId,
                                             @RequestBody QuizDTO quizDTO) {
        Quiz quiz = quizCreationService.getQuizForEditing(quizId, instructorId);
        Quiz updated = quizCreationService.updateQuiz(quizId, quizDTO);
        return ResponseEntity.ok(quizCreationService.convertToDTO(updated));
    }

    @DeleteMapping("/quizzes/{quizId}")
    public ResponseEntity<String> deleteQuiz(@PathVariable Long quizId,
                                            @RequestParam Long instructorId) {
        Quiz quiz = quizCreationService.getQuizForEditing(quizId, instructorId);
        quizCreationService.deleteQuiz(quizId);
        return ResponseEntity.ok("Quiz deleted successfully");
    }

    @PostMapping("/quizzes/{quizId}/publish")
    public ResponseEntity<QuizDTO> publishQuiz(@PathVariable Long quizId,
                                              @RequestParam Long instructorId) {
        Quiz quiz = quizCreationService.getQuizForEditing(quizId, instructorId);
        Quiz published = quizCreationService.publishQuiz(quizId);
        return ResponseEntity.ok(quizCreationService.convertToDTO(published));
    }

    @PostMapping("/quizzes/{quizId}/unpublish")
    public ResponseEntity<QuizDTO> unpublishQuiz(@PathVariable Long quizId,
                                                @RequestParam Long instructorId) {
        Quiz quiz = quizCreationService.getQuizForEditing(quizId, instructorId);
        Quiz unpublished = quizCreationService.unpublishQuiz(quizId);
        return ResponseEntity.ok(quizCreationService.convertToDTO(unpublished));
    }

    // ===== QUIZ QUESTIONS =====

    @GetMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<List<QuizQuestionDTO>> getQuizQuestions(@PathVariable Long quizId,
                                                                 @RequestParam Long instructorId) {
        Quiz quiz = quizCreationService.getQuizForEditing(quizId, instructorId);
        List<QuizQuestionDTO> dtos = quiz.getQuestions().stream()
                .map(quizCreationService::convertQuestionToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<QuizQuestionDTO> addQuestion(@PathVariable Long quizId,
                                                       @RequestParam Long instructorId,
                                                       @RequestBody QuizQuestionDTO questionDTO) {
        Quiz quiz = quizCreationService.getQuizForEditing(quizId, instructorId);
        QuizQuestion question = quizCreationService.addQuestionToQuiz(quizId, questionDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quizCreationService.convertQuestionToDTO(question));
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<QuizQuestionDTO> updateQuestion(@PathVariable Long questionId,
                                                         @RequestParam Long instructorId,
                                                         @RequestBody QuizQuestionDTO questionDTO) {
        QuizQuestion question = quizCreationService.updateQuestion(questionId, questionDTO);
        return ResponseEntity.ok(quizCreationService.convertQuestionToDTO(question));
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<String> deleteQuestion(@PathVariable Long questionId,
                                                @RequestParam Long instructorId) {
        quizCreationService.deleteQuestion(questionId);
        return ResponseEntity.ok("Question deleted successfully");
    }

    @PostMapping("/quizzes/{quizId}/reorder-questions")
    public ResponseEntity<String> reorderQuestions(@PathVariable Long quizId,
                                                  @RequestParam Long instructorId,
                                                  @RequestBody List<Long> questionIds) {
        Quiz quiz = quizCreationService.getQuizForEditing(quizId, instructorId);
        quizCreationService.reorderQuestions(quizId, questionIds);
        return ResponseEntity.ok("Questions reordered successfully");
    }

    @GetMapping("/quizzes/{quizId}/statistics")
    public ResponseEntity<QuizStatisticsDTO> getQuizStatistics(@PathVariable Long quizId,
                                                              @RequestParam Long instructorId) {
        Quiz quiz = quizCreationService.getQuizForEditing(quizId, instructorId);
        QuizStatisticsDTO stats = quizCreationService.getQuizStatistics(quizId);
        return ResponseEntity.ok(stats);
    }

    // ===== ATTENDANCE MANAGEMENT =====

    @GetMapping("/courses/{courseId}/enrollments")
    public ResponseEntity<List<EnrollmentDTO>> getCourseEnrollments(@PathVariable Long courseId,
                                                                   @RequestParam Long instructorId) {
        Course course = courseService.getCourseById(courseId);
        
        if (!course.getInstructor().getId().equals(instructorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByCourse(courseId);
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

    @PostMapping("/attendance/mark")
    public ResponseEntity<AttendanceDTO> markAttendance(@RequestParam Long enrollmentId,
                                                       @RequestParam Long instructorId,
                                                       @RequestBody AttendanceMarkRequest request) {
        Attendance attendance = attendanceService.markAttendance(
                enrollmentId,
                request.getClassDate(),
                request.getIsPresent(),
                instructorId,
                request.getRemarks()
        );

        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setEnrollmentId(attendance.getEnrollment().getId());
        dto.setClassDate(attendance.getClassDate());
        dto.setIsPresent(attendance.getIsPresent());
        dto.setRemarks(attendance.getRemarks());
        dto.setMarkedAt(attendance.getMarkedAt());

        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/courses/{courseId}/attendance")
    public ResponseEntity<List<AttendanceDTO>> getCourseAttendanceReport(@PathVariable Long courseId,
                                                                        @RequestParam Long instructorId) {
        Course course = courseService.getCourseById(courseId);
        
        if (!course.getInstructor().getId().equals(instructorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByCourse(courseId);
        List<AttendanceDTO> allRecords = enrollments.stream()
                .flatMap(e -> attendanceService.getAttendanceByEnrollmentAsDTO(e.getId()).stream())
                .collect(Collectors.toList());

        return ResponseEntity.ok(allRecords);
    }

    // ===== HELPER METHODS =====

    private CourseDTO convertCourseToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setCategory(course.getCategory());
        dto.setInstructor(convertInstructorToDTO(course.getInstructor()));
        dto.setEnrolledCount(course.getEnrollments().size());
        dto.setCreatedAt(course.getCreatedAt());
        return dto;
    }

    private InstructorDTO convertInstructorToDTO(Instructor instructor) {
        InstructorDTO dto = new InstructorDTO();
        dto.setId(instructor.getId());
        dto.setName(instructor.getName());
        dto.setEmail(instructor.getEmail());
        dto.setQualification(instructor.getQualification() != null ? instructor.getQualification().toString() : null);
        dto.setExperience(instructor.getExperience());
        return dto;
    }
}
