package lms.learnova.DTOs;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    // Common fields
    private String email;
    private String password;
    private String name;
    private String role; // "STUDENT" | "INSTRUCTOR"

    // Instructor-specific fields (only used when role=INSTRUCTOR)
    private String qualification; // "BS" | "MS" | "PhD"
    private Integer experience;   // years of experience
    private String bio;           // optional short bio
}
