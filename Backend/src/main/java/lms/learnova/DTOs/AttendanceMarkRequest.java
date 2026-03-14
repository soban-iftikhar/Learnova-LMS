package lms.learnova.DTOs;

import java.time.LocalDate;

public class AttendanceMarkRequest {
    private LocalDate classDate;
    private Boolean isPresent;
    private String remarks;

    public AttendanceMarkRequest() {
    }

    public AttendanceMarkRequest(LocalDate classDate, Boolean isPresent, String remarks) {
        this.classDate = classDate;
        this.isPresent = isPresent;
        this.remarks = remarks;
    }

    public LocalDate getClassDate() {
        return classDate;
    }

    public void setClassDate(LocalDate classDate) {
        this.classDate = classDate;
    }

    public Boolean getIsPresent() {
        return isPresent;
    }

    public void setIsPresent(Boolean isPresent) {
        this.isPresent = isPresent;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
