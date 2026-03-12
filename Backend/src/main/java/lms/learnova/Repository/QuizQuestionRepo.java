package lms.learnova.Repository;

import lms.learnova.Model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepo extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByQuizIdOrderByQuestionOrder(Long quizId);
    long countByQuizId(Long quizId);
}
