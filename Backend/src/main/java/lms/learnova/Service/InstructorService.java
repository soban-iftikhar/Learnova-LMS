package lms.learnova.Service;

import lms.learnova.Model.Instructor;
import lms.learnova.Repository.InstructorRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstructorService {

    private final InstructorRepo instructorRepo;

    @Autowired
    public InstructorService(InstructorRepo instructorRepo) {
        this.instructorRepo = instructorRepo;
    }

    public List<Instructor> getInstructors() {
        return instructorRepo.findAll();
    }

    public Instructor addInstructor(Instructor instructor) {
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
                .orElseThrow(() -> new RuntimeException("Course with ID " + id + " not found"));

                    existingInstructor.setName(instructor.getName());
                    existingInstructor.setEmail(instructor.getEmail());
                    existingInstructor.setPassword(instructor.getPassword());
                    existingInstructor.setQualification(instructor.getQualification());
                    existingInstructor.setExperience(instructor.getExperience());
                    existingInstructor.setJoiningDate(instructor.getJoiningDate());
                    return instructorRepo.save(existingInstructor);
    }

    public boolean login(String email, String password) {
        Instructor instructor = instructorRepo.findByEmail(email);
        if (instructor != null) {
            return instructor.getPassword().equals(password);
        }
        return false;
    }

    public Instructor signup(Instructor instructor) {
        if(instructorRepo.findByEmail(instructor.getEmail())!= null){
            throw new RuntimeException("Email already exists");
        }
        return instructorRepo.save(instructor);
    }
}
