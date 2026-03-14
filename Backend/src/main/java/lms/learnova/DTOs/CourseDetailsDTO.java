package lms.learnova.DTOs;

import java.time.LocalDateTime;
import java.util.List;

public class CourseDetailsDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private InstructorDTO instructor;
    private Long enrolledCount;
    private LocalDateTime createdAt;
    private List<CourseContentDTO> materials;

    public CourseDetailsDTO() {
    }

    public CourseDetailsDTO(Long id, String title, String description, String category, 
                           InstructorDTO instructor, Long enrolledCount, LocalDateTime createdAt, 
                           List<CourseContentDTO> materials) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.instructor = instructor;
        this.enrolledCount = enrolledCount;
        this.createdAt = createdAt;
        this.materials = materials;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public InstructorDTO getInstructor() {
        return instructor;
    }

    public void setInstructor(InstructorDTO instructor) {
        this.instructor = instructor;
    }

    public Long getEnrolledCount() {
        return enrolledCount;
    }

    public void setEnrolledCount(Long enrolledCount) {
        this.enrolledCount = enrolledCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<CourseContentDTO> getMaterials() {
        return materials;
    }

    public void setMaterials(List<CourseContentDTO> materials) {
        this.materials = materials;
    }
}
