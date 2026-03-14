package lms.learnova.Service;

import lms.learnova.exception.ResourceConflictException;
import lms.learnova.exception.ResourceNotFoundException;
import lms.learnova.exception.UnauthorizedException;
import lms.learnova.Model.Student;
import lms.learnova.Enum.Role;
import lms.learnova.Repository.StudentRepo;
import lms.learnova.Repository.UserRepo;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
public class StudentService {
    private final StudentRepo studentRepo;
    private final UserRepo userRepo;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public StudentService(
            StudentRepo studentRepo,
            UserRepo userRepo,
            JWTService jwtService,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder
    ) {
        this.studentRepo = studentRepo;
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }


    public List<Student> getStudents() {
        return studentRepo.findAll();
    }

    public Student addStudent(Student student) {
        ensureEmailIsAvailable(student.getEmail(), null);

        // Frontend signup may send firstName/lastName instead of name.
        // Use email prefix as a safe fallback to satisfy NOT NULL user_name.
        if (!StringUtils.hasText(student.getName())) {
            student.setName(extractNameFromEmail(student.getEmail()));
        }

        // Ensure registration number exists for student table constraints.
        if (!StringUtils.hasText(student.getRegistrationNumber())) {
            student.setRegistrationNumber("REG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        student.setRole(Role.STUDENT);
        student.setPassword(passwordEncoder.encode(student.getPassword()));
        return studentRepo.save(student);
    }

    public void deleteStudent(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Student id is required");
        }
        studentRepo.deleteById(id);
    }

    public Student getStudentById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Student id is required");
        }
        return studentRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student with ID " + id + " not found"));
    }

    public Student getStudentByEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Student email is required");
        }

        Student student = studentRepo.findByEmail(email);
        if (student == null) {
            throw new ResourceNotFoundException("Student with email " + email + " not found");
        }
        return student;
    }

    public Student updateStudent(Long id, Student student) {
        if (id == null) {
            throw new IllegalArgumentException("Student id is required");
        }
        Student existingStudent = studentRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student with ID " + id + " not found"));

        if (StringUtils.hasText(student.getEmail())) {
            ensureEmailIsAvailable(student.getEmail(), id);
            existingStudent.setEmail(student.getEmail());
        }

        if (StringUtils.hasText(student.getName())) {
            existingStudent.setName(student.getName());
        }

        if (StringUtils.hasText(student.getPassword())
            && !passwordEncoder.matches(student.getPassword(), existingStudent.getPassword())) {
            existingStudent.setPassword(passwordEncoder.encode(student.getPassword()));
        }

        if (StringUtils.hasText(student.getRegistrationNumber())) {
            existingStudent.setRegistrationNumber(student.getRegistrationNumber());
        }
        if (StringUtils.hasText(student.getDegreeProgram())) {
            existingStudent.setDegreeProgram(student.getDegreeProgram());
        }

        return studentRepo.save(existingStudent);
    }

    public String verify(Student student) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(student.getEmail(), student.getPassword())
            );
            if (authentication.isAuthenticated()) {
            return jwtService.generateToken(student.getEmail());
            }
        } catch (BadCredentialsException exception) {
            throw new UnauthorizedException("Invalid email or password");
        }

        throw new UnauthorizedException("Authentication failed");
    }

    private void ensureEmailIsAvailable(String email, Long currentStudentId) {
        if (!StringUtils.hasText(email)) {
            return;
        }

        var existingUser = userRepo.findByEmail(email);
        if (existingUser != null && !existingUser.getId().equals(currentStudentId)) {
            throw new ResourceConflictException("Email is already registered: " + email);
        }
    }

    private String extractNameFromEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return "Student";
        }

        int atIndex = email.indexOf('@');
        String localPart = atIndex > 0 ? email.substring(0, atIndex) : email;
        return StringUtils.hasText(localPart) ? localPart : "Student";
    }
}
