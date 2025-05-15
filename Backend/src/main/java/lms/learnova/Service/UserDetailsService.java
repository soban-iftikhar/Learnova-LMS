package lms.learnova.Service;

import lms.learnova.Model.User;
import lms.learnova.Model.UserPrincipal;
import lms.learnova.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UserRepo userRepo;
    @Autowired
    public UserDetailsService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String username) throws org.springframework.security.core.userdetails.UsernameNotFoundException {
        User user = userRepo.findByEmail(username);
                if(user == null) {
                    throw new UsernameNotFoundException("User not found with email: " + username);
                }
        return new UserPrincipal(user);
    }



}
