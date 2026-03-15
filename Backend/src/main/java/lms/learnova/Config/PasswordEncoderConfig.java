package lms.learnova.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Standalone configuration for PasswordEncoder.
 *
 * Moving this @Bean out of SecurityConfig breaks the cycle:
 *   OAuth2SuccessHandler → PasswordEncoder → SecurityConfig → OAuth2SuccessHandler
 *
 * Now the graph is:
 *   SecurityConfig       → (no PasswordEncoder @Bean here anymore)
 *   OAuth2SuccessHandler → PasswordEncoderConfig  ✅  (no cycle)
 *   SecurityConfig       → authenticationProvider() uses PasswordEncoder from here ✅
 */
@Configuration
public class PasswordEncoderConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
