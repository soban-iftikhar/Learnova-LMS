package lms.learnova.Controller;

import jakarta.servlet.http.HttpServletRequest;
import lms.learnova.DTOs.*;
import lms.learnova.Enum.Role;
import lms.learnova.Model.Instructor;
import lms.learnova.Model.Student;
import lms.learnova.Model.User;
import lms.learnova.Repository.UserRepo;
import lms.learnova.Service.InstructorService;
import lms.learnova.Service.JWTService;
import lms.learnova.Service.StudentService;
import lms.learnova.exception.ResourceNotFoundException;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

/**
 * Unified auth controller.
 * All endpoints live under /api/auth — matching the frontend API docs.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final StudentService studentService;
    private final InstructorService instructorService;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserRepo userRepo;

    public AuthController(StudentService studentService,
                          InstructorService instructorService,
                          JWTService jwtService,
                          AuthenticationManager authenticationManager,
                          UserRepo userRepo) {
        this.studentService = studentService;
        this.instructorService = instructorService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userRepo = userRepo;
    }

    // ─── POST /auth/register ─────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        Role role = parseRole(req.getRole());

        if (role == Role.INSTRUCTOR) {
            Instructor instructor = new Instructor();
            instructor.setName(req.getName());
            instructor.setEmail(req.getEmail());
            instructor.setPassword(req.getPassword());
            instructor.setRole(Role.INSTRUCTOR);  // Explicitly set role
            Instructor saved = instructorService.addInstructor(instructor);
            return ResponseEntity.status(HttpStatus.CREATED).body(buildUserResponse(saved));
        } else {
            Student student = new Student();
            student.setName(req.getName());
            student.setEmail(req.getEmail());
            student.setPassword(req.getPassword());
            student.setRole(Role.STUDENT);  // Explicitly set role
            Student saved = studentService.addStudent(student);
            return ResponseEntity.status(HttpStatus.CREATED).body(buildUserResponse(saved));
        }
    }

    // ─── POST /auth/login ────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
            if (!auth.isAuthenticated()) {
                throw new UnauthorizedException("Authentication failed");
            }
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepo.findByEmail(req.getEmail());
        if (user == null) throw new UnauthorizedException("User not found");

        String accessToken  = jwtService.generateToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        LoginResponse response = new LoginResponse();
        response.setAccess_token(accessToken);
        response.setRefresh_token(refreshToken);
        response.setUser(buildUserResponse(user));

        return ResponseEntity.ok(response);
    }

    // ─── POST /auth/refresh ──────────────────────────────────────────────────
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Refresh token missing");
        }
        String refreshToken = authHeader.substring(7);
        String email = jwtService.extractUsername(refreshToken);
        String newAccessToken = jwtService.generateToken(email);

        return ResponseEntity.ok(Map.of(
                "access_token", newAccessToken,
                "token_type", "Bearer"
        ));
    }

    // ─── POST /auth/logout ───────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ─── GET /auth/me ────────────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("Not authenticated");
        }
        String email = auth.getName();
        User user = userRepo.findByEmail(email);
        if (user == null) throw new ResourceNotFoundException("User not found");
        return ResponseEntity.ok(buildUserResponse(user));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Role parseRole(String roleStr) {
        if (roleStr == null) return Role.STUDENT;
        try {
            return Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Role.STUDENT;
        }
    }

    private UserResponse buildUserResponse(User user) {
        UserResponse r = new UserResponse();
        r.setId(user.getId());
        r.setEmail(user.getEmail());
        r.setName(user.getName());
        r.setRole(user.getRole().name());
        r.setCreated_at(Instant.now().toString());
        return r;
    }
}
