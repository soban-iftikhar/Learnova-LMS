package lms.learnova.DTOs;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private String role;      // "STUDENT" | "INSTRUCTOR" | "ADMIN"
    private String created_at;
}
