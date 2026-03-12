package lms.learnova.DTOs;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private Long id;
    private String bio;
    private String phoneNumber;
    private String dateOfBirth;
    private String profilePicturePath;
    private String address;
    private String city;
    private String country;
}
