package lms.learnova.Repository;

import lms.learnova.Model.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAnswerRepo extends JpaRepository<StudentAnswer, Long> {
    List<StudentAnswer> findByStudentIdAndQuizId(Long studentId, Long quizId);
    Optional<StudentAnswer> findByStudentIdAndQuizIdAndQuestionId(Long studentId, Long quizId, Long questionId);
    List<StudentAnswer> findByQuizId(Long quizId);
}
