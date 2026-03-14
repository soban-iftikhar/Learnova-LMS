package lms.learnova.DTOs;

public class StudentStatsDTO {
    private Long studentId;
    private String studentName;
    private String email;
    private String registrationNumber;
    private String degreeProgram;
    private Integer enrolledCourses;
    private Integer completedCourses;
    private Double averageScore;

    public StudentStatsDTO() {
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getDegreeProgram() {
        return degreeProgram;
    }

    public void setDegreeProgram(String degreeProgram) {
        this.degreeProgram = degreeProgram;
    }

    public Integer getEnrolledCourses() {
        return enrolledCourses;
    }

    public void setEnrolledCourses(Integer enrolledCourses) {
        this.enrolledCourses = enrolledCourses;
    }

    public Integer getCompletedCourses() {
        return completedCourses;
    }

    public void setCompletedCourses(Integer completedCourses) {
        this.completedCourses = completedCourses;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }
}
