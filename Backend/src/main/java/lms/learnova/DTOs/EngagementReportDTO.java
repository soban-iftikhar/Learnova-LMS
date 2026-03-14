package lms.learnova.DTOs;

public class EngagementReportDTO {
    private Integer totalStudents;
    private Integer activeStudents;
    private Integer inactiveStudents;
    private Integer completedCoursesCount;
    private Double enrollmentRate;
    private Double completionRate;
    private Integer totalQuizAttempts;

    public EngagementReportDTO() {}

    public Integer getTotalStudents() { return totalStudents; }
    public void setTotalStudents(Integer v) { this.totalStudents = v; }

    public Integer getActiveStudents() { return activeStudents; }
    public void setActiveStudents(Integer v) { this.activeStudents = v; }

    /** Alias used by AnalyticsApiController */
    public Integer getTotalActiveStudents() { return activeStudents != null ? activeStudents : 0; }

    public Integer getInactiveStudents() { return inactiveStudents; }
    public void setInactiveStudents(Integer v) { this.inactiveStudents = v; }

    public Integer getCompletedCoursesCount() { return completedCoursesCount; }
    public void setCompletedCoursesCount(Integer v) { this.completedCoursesCount = v; }

    public Double getEnrollmentRate() { return enrollmentRate; }
    public void setEnrollmentRate(Double v) { this.enrollmentRate = v; }

    public Double getCompletionRate() { return completionRate; }
    public void setCompletionRate(Double v) { this.completionRate = v; }

    public Integer getTotalQuizAttempts() { return totalQuizAttempts != null ? totalQuizAttempts : 0; }
    public void setTotalQuizAttempts(Integer v) { this.totalQuizAttempts = v; }
}
