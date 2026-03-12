package lms.learnova.DTOs;

public class EngagementReportDTO {
    private Integer totalStudents;
    private Integer activeStudents;
    private Integer inactiveStudents;
    private Integer completedCoursesCount;
    private Double enrollmentRate;
    private Double completionRate;

    public EngagementReportDTO() {
    }

    public Integer getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(Integer totalStudents) {
        this.totalStudents = totalStudents;
    }

    public Integer getActiveStudents() {
        return activeStudents;
    }

    public void setActiveStudents(Integer activeStudents) {
        this.activeStudents = activeStudents;
    }

    public Integer getInactiveStudents() {
        return inactiveStudents;
    }

    public void setInactiveStudents(Integer inactiveStudents) {
        this.inactiveStudents = inactiveStudents;
    }

    public Integer getCompletedCoursesCount() {
        return completedCoursesCount;
    }

    public void setCompletedCoursesCount(Integer completedCoursesCount) {
        this.completedCoursesCount = completedCoursesCount;
    }

    public Double getEnrollmentRate() {
        return enrollmentRate;
    }

    public void setEnrollmentRate(Double enrollmentRate) {
        this.enrollmentRate = enrollmentRate;
    }

    public Double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(Double completionRate) {
        this.completionRate = completionRate;
    }
}
