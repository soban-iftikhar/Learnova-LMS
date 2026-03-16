package lms.learnova.Controller;

import lms.learnova.Model.*;
import lms.learnova.Repository.*;
import lms.learnova.exception.ResourceNotFoundException;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Teacher views a student's profile and performance.
 * GET /teacher/students/{studentId}
 */
@RestController
@RequestMapping("/teacher")
public class TeacherStudentController {

    private final UserRepo          userRepo;
    private final EnrollmentRepo    enrollmentRepo;
    private final StudentAnswerRepo studentAnswerRepo;
    private final QuizRepo          quizRepo;
    private final UserProfileRepo   profileRepo;

    public TeacherStudentController(UserRepo userRepo, EnrollmentRepo enrollmentRepo,
                                     StudentAnswerRepo studentAnswerRepo,
                                     QuizRepo quizRepo, UserProfileRepo profileRepo) {
        this.userRepo           = userRepo;
        this.enrollmentRepo     = enrollmentRepo;
        this.studentAnswerRepo  = studentAnswerRepo;
        this.quizRepo           = quizRepo;
        this.profileRepo        = profileRepo;
    }

    /**
     * GET /teacher/students/{studentId}
     * Returns student basic info, enrolled courses, and quiz performance.
     */
    @GetMapping("/students/{studentId}")
    public ResponseEntity<?> getStudentProfile(@PathVariable Long studentId) {
        // Verify caller is authenticated
        getCurrentUserId();

        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        // Basic info
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("id",    student.getId());
        info.put("name",  student.getName());
        info.put("email", student.getEmail());
        info.put("role",  student.getRole().name());

        if (student instanceof Student s) {
            info.put("registration_number", s.getRegistrationNumber());
            info.put("degree_program",      s.getDegreeProgram());
        }

        UserProfile profile = profileRepo.findByUserId(studentId);
        if (profile != null) {
            info.put("bio",   profile.getBio()         != null ? profile.getBio()         : "");
            info.put("phone", profile.getPhoneNumber() != null ? profile.getPhoneNumber() : "");
        }

        // Enrolled courses
        List<Enrollment> enrollments = enrollmentRepo.findByStudentId(studentId).stream()
                .filter(e -> !"DROPPED".equalsIgnoreCase(e.getStatus()))
                .collect(Collectors.toList());

        List<Map<String, Object>> courses = enrollments.stream().map(e -> {
            // Quiz progress
            long totalQuizzes    = quizRepo.findByCourseIdAndIsPublishedTrue(e.getCourse().getId()).size();
            long attemptedQuizzes = studentAnswerRepo.findByStudentId(studentId).stream()
                    .filter(sa -> sa.getQuiz() != null && sa.getQuiz().getCourse() != null
                            && e.getCourse().getId().equals(sa.getQuiz().getCourse().getId()))
                    .map(sa -> sa.getQuiz().getId()).distinct().count();
            int progress = totalQuizzes == 0 ? 0 : (int) Math.min(100, attemptedQuizzes * 100 / totalQuizzes);

            Map<String, Object> cm = new LinkedHashMap<>();
            cm.put("enrollment_id",    e.getId());
            cm.put("course_id",        e.getCourse().getId());
            cm.put("course_title",     e.getCourse().getTitle());
            cm.put("status",           e.getStatus());
            cm.put("enrolled_at",      e.getEnrollmentDate() != null ? e.getEnrollmentDate().toString() : "");
            cm.put("progress",         progress);
            return cm;
        }).collect(Collectors.toList());

        // Quiz performance summary
        List<StudentAnswer> allAnswers = studentAnswerRepo.findByStudentId(studentId);
        Map<Long, List<StudentAnswer>> byQuiz = allAnswers.stream()
                .filter(sa -> sa.getQuiz() != null)
                .collect(Collectors.groupingBy(sa -> sa.getQuiz().getId()));

        List<Map<String, Object>> quizResults = byQuiz.entrySet().stream().map(entry -> {
            List<StudentAnswer> qAnswers = entry.getValue();
            int total    = qAnswers.stream().mapToInt(sa -> sa.getQuestion() != null
                    && sa.getQuestion().getMarks() != null ? sa.getQuestion().getMarks() : 1).sum();
            int obtained = qAnswers.stream().mapToInt(sa -> sa.getMarksObtained() != null
                    ? sa.getMarksObtained() : 0).sum();
            double pct   = total > 0 ? Math.round(obtained * 100.0 / total * 10.0) / 10.0 : 0.0;
            StudentAnswer first = qAnswers.get(0);

            Map<String, Object> r = new LinkedHashMap<>();
            r.put("quiz_id",      entry.getKey());
            r.put("quiz_title",   first.getQuiz().getTitle());
            r.put("score",        obtained);
            r.put("max_score",    total);
            r.put("percentage",   pct);
            r.put("passed",       pct >= 70.0);
            r.put("submitted_at", first.getSubmittedAt() != null ? first.getSubmittedAt().toString() : "");
            return r;
        }).sorted((a, b) -> String.valueOf(b.get("submitted_at")).compareTo(String.valueOf(a.get("submitted_at"))))
          .collect(Collectors.toList());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("student",      info);
        resp.put("courses",      courses);
        resp.put("quiz_results", quizResults);
        resp.put("total_courses",     courses.size());
        resp.put("completed_courses", courses.stream().filter(c -> "COMPLETED".equals(c.get("status"))).count());
        resp.put("quizzes_taken",     quizResults.size());
        return ResponseEntity.ok(resp);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user.getId();
    }
}
