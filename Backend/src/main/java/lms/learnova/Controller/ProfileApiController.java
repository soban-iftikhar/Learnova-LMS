package lms.learnova.Controller;

import lms.learnova.Model.User;
import lms.learnova.Model.UserProfile;
import lms.learnova.Repository.UserProfileRepo;
import lms.learnova.Repository.UserRepo;
import lms.learnova.exception.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Profile management — persists bio / name changes to the DB.
 *
 * GET  /profile/me           — fetch current user's profile (name + bio)
 * PUT  /profile/me           — update name and/or bio
 */
@RestController
@RequestMapping("/profile")
public class ProfileApiController {

    private final UserRepo        userRepo;
    private final UserProfileRepo profileRepo;

    public ProfileApiController(UserRepo userRepo, UserProfileRepo profileRepo) {
        this.userRepo    = userRepo;
        this.profileRepo = profileRepo;
    }

    // GET /profile/me
    @GetMapping("/me")
    public ResponseEntity<?> getProfile() {
        User user = currentUser();

        UserProfile profile = profileRepo.findByUserId(user.getId());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id",    user.getId());
        resp.put("name",  user.getName());
        resp.put("email", user.getEmail());
        resp.put("role",  user.getRole().name());
        resp.put("bio",   profile != null && profile.getBio() != null ? profile.getBio() : "");
        resp.put("phone", profile != null && profile.getPhoneNumber() != null ? profile.getPhoneNumber() : "");
        return ResponseEntity.ok(resp);
    }

    // PUT /profile/me
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> body) {
        User user = currentUser();

        // Persist name change on the User entity itself
        if (body.containsKey("name")) {
            String newName = String.valueOf(body.get("name")).trim();
            if (!newName.isEmpty()) {
                user.setName(newName);
                userRepo.save(user);
            }
        }

        // Persist bio / phone in UserProfile
        UserProfile profile = profileRepo.findByUserId(user.getId());
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
        }
        if (body.containsKey("bio")) {
            profile.setBio(String.valueOf(body.get("bio")));
        }
        if (body.containsKey("phone")) {
            profile.setPhoneNumber(String.valueOf(body.get("phone")));
        }
        profileRepo.save(profile);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id",    user.getId());
        resp.put("name",  user.getName());
        resp.put("email", user.getEmail());
        resp.put("role",  user.getRole().name());
        resp.put("bio",   profile.getBio()         != null ? profile.getBio()         : "");
        resp.put("phone", profile.getPhoneNumber() != null ? profile.getPhoneNumber() : "");
        resp.put("message", "Profile updated successfully");
        return ResponseEntity.ok(resp);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────
    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new UnauthorizedException("Not authenticated");
        User user = userRepo.findByEmail(auth.getName());
        if (user == null) throw new UnauthorizedException("User not found");
        return user;
    }
}
