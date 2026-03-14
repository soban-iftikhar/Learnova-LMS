package lms.learnova.DTOs;

import java.time.LocalDateTime;

public class CourseStatsDTO {
    private Long courseId;
    private String courseTitle;
    private String instructorName;
    private Integer totalEnrollments;
    private Integer activeEnrollments;
    private Integer completedEnrollments;
    private Integer dropoutCount;
    private LocalDateTime createdAt;

    public CourseStatsDTO() {
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }

    public String getInstructorName() {
        return instructorName;
    }

    public void setInstructorName(String instructorName) {
        this.instructorName = instructorName;
    }

    public Integer getTotalEnrollments() {
        return totalEnrollments;
    }

    public void setTotalEnrollments(Integer totalEnrollments) {
        this.totalEnrollments = totalEnrollments;
    }

    public Integer getActiveEnrollments() {
        return activeEnrollments;
    }

    public void setActiveEnrollments(Integer activeEnrollments) {
        this.activeEnrollments = activeEnrollments;
    }

    public Integer getCompletedEnrollments() {
        return completedEnrollments;
    }

    public void setCompletedEnrollments(Integer completedEnrollments) {
        this.completedEnrollments = completedEnrollments;
    }

    public Integer getDropoutCount() {
        return dropoutCount;
    }

    public void setDropoutCount(Integer dropoutCount) {
        this.dropoutCount = dropoutCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
