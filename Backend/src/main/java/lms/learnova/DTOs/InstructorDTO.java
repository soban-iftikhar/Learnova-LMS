package lms.learnova.DTOs;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InstructorDTO {
    private Long id;
    private String name;
    private String email;
    private String qualification;
    private int experience;
}
