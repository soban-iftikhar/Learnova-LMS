package lms.learnova.DTOs;

public class SystemStatsDTO {
    private Integer totalInstructors;
    private Integer totalStudents;
    private Integer totalUsers;
    private Integer totalCourses;
    private Integer totalEnrollments;
    private Integer activeEnrollments;
    private Integer completedEnrollments;

    public SystemStatsDTO() {
    }

    public Integer getTotalInstructors() {
        return totalInstructors;
    }

    public void setTotalInstructors(Integer totalInstructors) {
        this.totalInstructors = totalInstructors;
    }

    public Integer getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(Integer totalStudents) {
        this.totalStudents = totalStudents;
    }

    public Integer getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Integer totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Integer getTotalCourses() {
        return totalCourses;
    }

    public void setTotalCourses(Integer totalCourses) {
        this.totalCourses = totalCourses;
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
}
