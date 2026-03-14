package lms.learnova.DTOs;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    private String email;
    private String password;
    private String name;
    private String role; // "STUDENT" | "INSTRUCTOR"
}
