package lms.learnova.Service;

import lms.learnova.Model.Instructor;
import lms.learnova.Repository.InstructorRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstructorService {

    @Autowired
    private JWTService jwtService;
    @Autowired
    private  AuthenticationManager authenticationManager;
    private final InstructorRepo instructorRepo;
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);

    @Autowired
    public InstructorService(InstructorRepo instructorRepo) {
        this.instructorRepo = instructorRepo;
    }

    public List<Instructor> getInstructors() {
        return instructorRepo.findAll();
    }

    public Instructor addInstructor(Instructor instructor) {
        instructor.setPassword(bCryptPasswordEncoder.encode(instructor.getPassword()));
        return instructorRepo.save(instructor);
    }

    public void deleteInstructor(Long id) {
        instructorRepo.deleteById(id);
    }

    public Instructor getInstructorById(Long id) {
        return instructorRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Instructor with ID " + id + " not found"));
    }

    public Instructor updateInstructor(Long id, Instructor instructor) {
        Instructor existingInstructor = instructorRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Instructor with ID " + id + " not found"));

        existingInstructor.setName(instructor.getName());
        existingInstructor.setEmail(instructor.getEmail());

        if (!bCryptPasswordEncoder.matches(instructor.getPassword(), existingInstructor.getPassword())) {
            existingInstructor.setPassword(bCryptPasswordEncoder.encode(instructor.getPassword()));
        }

        existingInstructor.setQualification(instructor.getQualification());
        existingInstructor.setExperience(instructor.getExperience());
        existingInstructor.setJoiningDate(instructor.getJoiningDate());

        return instructorRepo.save(existingInstructor);
    }



    public String verify(Instructor instructor) {
       Authentication authentication =
               authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(instructor.getEmail(), instructor.getPassword()));
       if (authentication.isAuthenticated())
           return jwtService.generateToken(instructor.getEmail());
       return "Failed";
    }
}
