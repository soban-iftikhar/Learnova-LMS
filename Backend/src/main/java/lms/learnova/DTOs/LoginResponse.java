package lms.learnova.DTOs;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LoginResponse {
    private String access_token;
    private String refresh_token;
    private UserResponse user;
}
