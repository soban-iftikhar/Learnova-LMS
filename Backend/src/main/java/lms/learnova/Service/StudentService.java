package lms.learnova.Service;

import lms.learnova.exception.ResourceConflictException;
import lms.learnova.exception.ResourceNotFoundException;
import lms.learnova.exception.UnauthorizedException;
import lms.learnova.Model.Student;
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

    public Student updateStudent(Long id, Student student) {
        if (id == null) {
            throw new IllegalArgumentException("Student id is required");
        }
        Student existingStudent = studentRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student with ID " + id + " not found"));

        ensureEmailIsAvailable(student.getEmail(), id);

        existingStudent.setName(student.getName());
        existingStudent.setEmail(student.getEmail());

        if (StringUtils.hasText(student.getPassword())
            && !passwordEncoder.matches(student.getPassword(), existingStudent.getPassword())) {
            existingStudent.setPassword(passwordEncoder.encode(student.getPassword()));
        }

        existingStudent.setRegistrationNumber(student.getRegistrationNumber());
        existingStudent.setDegreeProgram(student.getDegreeProgram());

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
}
