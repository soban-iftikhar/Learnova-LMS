package lms.learnova.Controller;

import lms.learnova.Model.Course;
import lms.learnova.Model.Instructor;
import lms.learnova.Service.InstructorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/instructor")
public class InstructorController {

    private final InstructorService instructorService;

    @Autowired
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
    public ResponseEntity<?> addInstructor(@RequestBody Instructor instructor) {
        try {
            Instructor savedInstructor = instructorService.addInstructor(instructor);
            return ResponseEntity.ok(savedInstructor);
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/updateInstructor/{id}")
    public ResponseEntity<?> updateInstructor(@PathVariable Long id, @RequestBody Instructor instructor) {
        try {
            Instructor updated = instructorService.updateInstructor(id, instructor);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }


    @DeleteMapping("/deleteInstructor/{id}")
    public ResponseEntity<?> deleteInstructor(@PathVariable Long id) {
        try {
            instructorService.deleteInstructor(id);
            return ResponseEntity.ok("Instructor deleted successfully");
        }
        catch (Exception e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error" + e.getMessage());
        }

    }

}
