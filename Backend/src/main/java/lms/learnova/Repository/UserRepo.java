package lms.learnova.Repository;

import lms.learnova.Enum.Role;
import lms.learnova.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepo extends JpaRepository<User, Long> {

    User findByEmail(String email);
    List<User> findByRole(Role role);
}
