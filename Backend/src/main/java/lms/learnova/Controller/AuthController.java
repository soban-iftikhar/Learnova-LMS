package lms.learnova.Controller;

import lms.learnova.Model.Instructor;
import lms.learnova.Model.Student;
import lms.learnova.Service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private InstructorService instructorService;
    @Autowired
    private StudentService studentService;

    @PostMapping("/login/student")
    public String loginStudent(@RequestParam String email, @RequestParam String password) {
        boolean isAuthenticated = studentService.login(email, password);
        if (isAuthenticated) {
            return "Login successful";
        } else {
            return "Invalid email or password";
        }
    }

    @PostMapping("/login/instructor")
    public String loginInstructor(@RequestParam String email, @RequestParam String password) {
        boolean isAuthenticated = instructorService.login(email, password);
        if (isAuthenticated) {
            return "Login successful";
        } else {
            return "Invalid email or password";
        }
    }

    @PostMapping("/signup/student")
    public ResponseEntity<?> signupStudent(@RequestBody Student student) {
        try {
            Student savedStudent = studentService.signup(student);
            return ResponseEntity.ok(savedStudent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/signup/instructor")
    public ResponseEntity<?> signupInstructor(@RequestBody Instructor instructor) {
        try {
            Instructor savedInstructor = instructorService.signup(instructor);
            return ResponseEntity.ok(savedInstructor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
