package lms.learnova.Config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lms.learnova.Enum.Role;
import lms.learnova.Model.Student;
import lms.learnova.Model.User;
import lms.learnova.Repository.StudentRepo;
import lms.learnova.Repository.UserRepo;
import lms.learnova.Service.JWTService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * Handles successful OAuth2 logins (Google / GitHub).
 *
 * Dependencies (none of these depend on SecurityConfig):
 *   - UserRepo           → just a JPA repository
 *   - StudentRepo        → just a JPA repository
 *   - JWTService         → standalone @Service
 *   - PasswordEncoder    → from PasswordEncoderConfig (NOT from SecurityConfig)
 */
@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepo        userRepo;
    private final StudentRepo     studentRepo;
    private final JWTService      jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public OAuth2SuccessHandler(UserRepo userRepo,
                                StudentRepo studentRepo,
                                JWTService jwtService,
                                PasswordEncoder passwordEncoder) {
        this.userRepo        = userRepo;
        this.studentRepo     = studentRepo;
        this.jwtService      = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name  = oAuth2User.getAttribute("name");
        if (name == null || name.isBlank()) name = email;

        // Find or auto-create the user as STUDENT
        User user = userRepo.findByEmail(email);
        if (user == null) {
            Student s = new Student();
            s.setEmail(email);
            s.setName(name);
            s.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            s.setRole(Role.STUDENT);
            user = studentRepo.save(s);
        }

        String accessToken  = jwtService.generateToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        String redirectUrl = String.format(
            "%s/oauth-callback?access_token=%s&refresh_token=%s&role=%s",
            frontendUrl, accessToken, refreshToken, user.getRole().name()
        );
        response.sendRedirect(redirectUrl);
    }
}
