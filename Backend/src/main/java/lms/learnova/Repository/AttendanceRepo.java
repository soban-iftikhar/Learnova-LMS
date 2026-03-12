package lms.learnova.Repository;

import lms.learnova.Model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepo extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEnrollmentId(Long enrollmentId);
    List<Attendance> findByEnrollmentIdAndClassDate(Long enrollmentId, LocalDate classDate);
    long countByEnrollmentIdAndIsPresentTrue(Long enrollmentId);
}
