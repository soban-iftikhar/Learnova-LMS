package lms.learnova.Service;

import lms.learnova.DTOs.AttendanceDTO;
import lms.learnova.Model.Attendance;
import lms.learnova.Model.Enrollment;
import lms.learnova.Model.Instructor;
import lms.learnova.Repository.AttendanceRepo;
import lms.learnova.Repository.EnrollmentRepo;
import lms.learnova.Repository.InstructorRepo;
import lms.learnova.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {
    private final AttendanceRepo attendanceRepo;
    private final EnrollmentRepo enrollmentRepo;
    private final InstructorRepo instructorRepo;

    public AttendanceService(AttendanceRepo attendanceRepo, EnrollmentRepo enrollmentRepo, 
                            InstructorRepo instructorRepo) {
        this.attendanceRepo = attendanceRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.instructorRepo = instructorRepo;
    }

    // Mark attendance for a single student in a course
    @Transactional
    public Attendance markAttendance(Long enrollmentId, LocalDate classDate, 
                                     boolean isPresent, Long instructorId, String remarks) {
        Enrollment enrollment = enrollmentRepo.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
        
        Instructor instructor = instructorRepo.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

        // Check if attendance already marked for this date
        Attendance existingAttendance = attendanceRepo.findByEnrollmentIdAndClassDate(enrollmentId, classDate)
                .orElse(null);

        Attendance attendance;
        if (existingAttendance != null) {
            // Update existing record
            attendance = existingAttendance;
        } else {
            // Create new record
            attendance = new Attendance();
            attendance.setEnrollment(enrollment);
            attendance.setClassDate(classDate);
        }

        attendance.setIsPresent(isPresent);
        attendance.setMarkedBy(instructor);
        attendance.setMarkedAt(LocalDateTime.now());
        attendance.setRemarks(remarks);

        return attendanceRepo.save(attendance);
    }

    // Get attendance records for an enrollment
    public List<Attendance> getAttendanceByEnrollment(Long enrollmentId) {
        return attendanceRepo.findByEnrollmentId(enrollmentId);
    }

    // Get attendance percentage for an enrollment
    public double getAttendancePercentage(Long enrollmentId) {
        List<Attendance> allRecords = getAttendanceByEnrollment(enrollmentId);
        
        if (allRecords.isEmpty()) {
            return 0.0;
        }

        long presentDays = allRecords.stream().filter(Attendance::getIsPresent).count();
        return (presentDays * 100.0) / allRecords.size();
    }

    // Get attendance for a specific date
    public Attendance getAttendanceByEnrollmentAndDate(Long enrollmentId, LocalDate date) {
        return attendanceRepo.findByEnrollmentIdAndClassDate(enrollmentId, date)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));
    }

    // Mark attendance for multiple students in a course (bulk operation)
    @Transactional
    public List<Attendance> markBulkAttendance(Long courseId, LocalDate classDate, 
                                               List<Long> enrollmentIds, Long instructorId, String remarks) {
        Instructor instructor = instructorRepo.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

        return enrollmentIds.stream()
                .map(enrollmentId -> markAttendance(enrollmentId, classDate, true, instructorId, remarks))
                .collect(Collectors.toList());
    }

    // Convert to DTO
    public AttendanceDTO convertToDTO(Attendance attendance) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setEnrollmentId(attendance.getEnrollment().getId());
        dto.setClassDate(attendance.getClassDate());
        dto.setIsPresent(attendance.getIsPresent());
        dto.setRemarks(attendance.getRemarks());
        dto.setMarkedAt(attendance.getMarkedAt());
        return dto;
    }

    // Get attendance records as DTOs
    public List<AttendanceDTO> getAttendanceByEnrollmentAsDTO(Long enrollmentId) {
        return getAttendanceByEnrollment(enrollmentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
