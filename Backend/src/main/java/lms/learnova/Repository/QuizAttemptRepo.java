package lms.learnova.Repository;

import lms.learnova.Model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepo extends JpaRepository<QuizAttempt, Long> {
    
    /**
     * Check if a student has already attempted a quiz
     */
    Optional<QuizAttempt> findByStudentIdAndQuizId(Long studentId, Long quizId);
    
    /**
     * Get all attempts for a specific quiz (marks sheet)
     */
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.quiz.id = :quizId ORDER BY qa.attemptedAt DESC")
    List<QuizAttempt> findByQuizId(@Param("quizId") Long quizId);
    
    /**
     * Get all attempts for a student
     */
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.student.id = :studentId ORDER BY qa.attemptedAt DESC")
    List<QuizAttempt> findByStudentId(@Param("studentId") Long studentId);
    
    /**
     * Unlock a quiz for a specific student (allow retry)
     */
    @Modifying
    @Transactional
    @Query("UPDATE QuizAttempt qa SET qa.isLocked = false WHERE qa.student.id = :studentId AND qa.quiz.id = :quizId")
    void unlockQuizForStudent(@Param("studentId") Long studentId, @Param("quizId") Long quizId);
    
    /**
     * Unlock a quiz for all students who attempted it
     */
    @Modifying
    @Transactional
    @Query("UPDATE QuizAttempt qa SET qa.isLocked = false WHERE qa.quiz.id = :quizId")
    void unlockQuizForAllStudents(@Param("quizId") Long quizId);
    
    /**
     * Delete all attempts for a quiz
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM QuizAttempt qa WHERE qa.quiz.id = :quizId")
    void deleteAllByQuizId(@Param("quizId") Long quizId);
    
    /**
     * Count total attempts for a quiz
     */
    @Query("SELECT COUNT(qa) FROM QuizAttempt qa WHERE qa.quiz.id = :quizId")
    long countByQuizId(@Param("quizId") Long quizId);
}
