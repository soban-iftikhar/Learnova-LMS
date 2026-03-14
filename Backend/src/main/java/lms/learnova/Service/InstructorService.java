package lms.learnova.Service;

import lms.learnova.exception.ResourceConflictException;
import lms.learnova.exception.ResourceNotFoundException;
import lms.learnova.exception.UnauthorizedException;
import lms.learnova.Model.Instructor;
import lms.learnova.Repository.InstructorRepo;
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
public class InstructorService {

    private final InstructorRepo instructorRepo;
    private final UserRepo userRepo;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public InstructorService(
            InstructorRepo instructorRepo,
            UserRepo userRepo,
            JWTService jwtService,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder
    ) {
        this.instructorRepo = instructorRepo;
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Instructor> getInstructors() {
        return instructorRepo.findAll();
    }

    public Instructor addInstructor(Instructor instructor) {
        ensureEmailIsAvailable(instructor.getEmail(), null);
        instructor.setPassword(passwordEncoder.encode(instructor.getPassword()));
        return instructorRepo.save(instructor);
    }

    public void deleteInstructor(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Instructor id is required");
        }
        instructorRepo.deleteById(id);
    }

    public Instructor getInstructorById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Instructor id is required");
        }
        return instructorRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Instructor with ID " + id + " not found"));
    }

    public Instructor updateInstructor(Long id, Instructor instructor) {
        if (id == null) {
            throw new IllegalArgumentException("Instructor id is required");
        }
        Instructor existingInstructor = instructorRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Instructor with ID " + id + " not found"));

        ensureEmailIsAvailable(instructor.getEmail(), id);

        existingInstructor.setName(instructor.getName());
        existingInstructor.setEmail(instructor.getEmail());

        if (StringUtils.hasText(instructor.getPassword())
            && !passwordEncoder.matches(instructor.getPassword(), existingInstructor.getPassword())) {
            existingInstructor.setPassword(passwordEncoder.encode(instructor.getPassword()));
        }

        existingInstructor.setQualification(instructor.getQualification());
        existingInstructor.setExperience(instructor.getExperience());
        existingInstructor.setJoiningDate(instructor.getJoiningDate());

        return instructorRepo.save(existingInstructor);
    }



    public String verify(Instructor instructor) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(instructor.getEmail(), instructor.getPassword())
            );
            if (authentication.isAuthenticated()) {
                return jwtService.generateToken(instructor.getEmail());
            }
        } catch (BadCredentialsException exception) {
            throw new UnauthorizedException("Invalid email or password");
        }

        throw new UnauthorizedException("Authentication failed");
    }

    private void ensureEmailIsAvailable(String email, Long currentInstructorId) {
        if (!StringUtils.hasText(email)) {
            return;
        }

        var existingUser = userRepo.findByEmail(email);
        if (existingUser != null && !existingUser.getId().equals(currentInstructorId)) {
            throw new ResourceConflictException("Email is already registered: " + email);
        }
    }
}
