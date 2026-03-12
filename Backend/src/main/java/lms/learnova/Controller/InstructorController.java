package lms.learnova.Controller;

import lms.learnova.Model.Instructor;
import lms.learnova.Service.InstructorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/instructor")
public class InstructorController {

    private final InstructorService instructorService;


    public InstructorController(InstructorService instructorService){
        this.instructorService = instructorService;
    }

    @GetMapping("/getInstructors")
    public List <Instructor> getInstructors() {
        return instructorService.getInstructors();
    }

    @GetMapping("/searchInstructor/{id}")
    public Instructor getInstructorById(@PathVariable Long id) {
        return instructorService.getInstructorById(id);
    }


    @PostMapping("/registerInstructor")
    public ResponseEntity<Instructor> addInstructor(@RequestBody Instructor instructor) {
        Instructor savedInstructor = instructorService.addInstructor(instructor);
        return ResponseEntity.ok(savedInstructor);
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginInstructor(@RequestBody Instructor instructor) {
        String loggedInInstructor = instructorService.verify(instructor);
        return ResponseEntity.ok(loggedInInstructor);
    }

    @PutMapping("/updateInstructor/{id}")
    public ResponseEntity<Instructor> updateInstructor(@PathVariable Long id, @RequestBody Instructor instructor) {
        Instructor updated = instructorService.updateInstructor(id, instructor);
        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/deleteInstructor/{id}")
    public ResponseEntity<String> deleteInstructor(@PathVariable Long id) {
        instructorService.deleteInstructor(id);
        return ResponseEntity.ok("Instructor deleted successfully");
    }

}
