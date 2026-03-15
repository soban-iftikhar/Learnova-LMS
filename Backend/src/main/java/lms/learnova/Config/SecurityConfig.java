package lms.learnova.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Main security configuration.
 *
 * PasswordEncoder is now defined in PasswordEncoderConfig (separate class).
 * OAuth2SuccessHandler is a standalone @Component.
 *
 * Dependency graph (no cycles):
 *   SecurityConfig       → JWTFilter, UserDetailsService, PasswordEncoderConfig, OAuth2SuccessHandler
 *   OAuth2SuccessHandler → UserRepo, StudentRepo, JWTService, PasswordEncoderConfig
 *   PasswordEncoderConfig → nothing
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JWTFilter            jwtFilter;
    private final UserDetailsService   userDetailsService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final PasswordEncoder      passwordEncoder;

    public SecurityConfig(JWTFilter jwtFilter,
                          UserDetailsService userDetailsService,
                          OAuth2SuccessHandler oAuth2SuccessHandler,
                          PasswordEncoder passwordEncoder) {
        this.jwtFilter            = jwtFilter;
        this.userDetailsService   = userDetailsService;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.passwordEncoder      = passwordEncoder;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(req -> req
                .requestMatchers("/auth/register", "/auth/login", "/auth/refresh").permitAll()
                .requestMatchers(
                    "/instructor/registerInstructor", "/instructor/login",
                    "/student/registerStudent",       "/student/login"
                ).permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/courses").permitAll()
                .requestMatchers("/login/oauth2/**", "/oauth2/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:5176"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);  // injected from PasswordEncoderConfig
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
