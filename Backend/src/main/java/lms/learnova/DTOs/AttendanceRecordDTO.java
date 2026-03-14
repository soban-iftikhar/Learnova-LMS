package lms.learnova.DTOs;

import java.util.List;

public class AttendanceRecordDTO {
    private Long courseId;
    private double attendancePercentage;
    private List<AttendanceDTO> attendanceRecords;

    public AttendanceRecordDTO() {
    }

    public AttendanceRecordDTO(Long courseId, double attendancePercentage, List<AttendanceDTO> attendanceRecords) {
        this.courseId = courseId;
        this.attendancePercentage = attendancePercentage;
        this.attendanceRecords = attendanceRecords;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public List<AttendanceDTO> getAttendanceRecords() {
        return attendanceRecords;
    }

    public void setAttendanceRecords(List<AttendanceDTO> attendanceRecords) {
        this.attendanceRecords = attendanceRecords;
    }
}
