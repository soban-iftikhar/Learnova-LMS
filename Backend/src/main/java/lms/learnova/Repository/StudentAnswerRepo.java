package lms.learnova.Repository;

import lms.learnova.Model.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAnswerRepo extends JpaRepository<StudentAnswer, Long> {

    List<StudentAnswer> findByStudentIdAndQuizId(Long studentId, Long quizId);

    Optional<StudentAnswer> findByStudentIdAndQuizIdAndQuestionId(
            Long studentId, Long quizId, Long questionId);

    List<StudentAnswer> findByQuizId(Long quizId);

    List<StudentAnswer> findByStudentId(Long studentId);

    /**
     * Returns the most recent answer per (student, quiz) combination
     * for quizzes that belong to courses in the given list.
     * Used by the instructor dashboard — avoids SELECT * FROM student_answers.
     */
    @Query("""
            SELECT sa FROM StudentAnswer sa
            WHERE sa.quiz.course.id IN :courseIds
            ORDER BY sa.submittedAt DESC
            """)
    List<StudentAnswer> findByCourseIds(@Param("courseIds") List<Long> courseIds);

    /**
     * Fetches answers for a specific quiz (used by quiz-results endpoint).
     * Equivalent to findByQuizId but named explicitly for clarity.
     */
    @Query("SELECT sa FROM StudentAnswer sa WHERE sa.quiz.id IN :quizIds")
    List<StudentAnswer> findByQuizIds(@Param("quizIds") List<Long> quizIds);
}
