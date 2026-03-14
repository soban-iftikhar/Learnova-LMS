package lms.learnova.Repository;

import lms.learnova.Model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserProfileRepo extends JpaRepository<UserProfile, Long> {
    UserProfile findByUserId(Long userId);
}
