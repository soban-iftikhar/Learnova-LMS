package lms.learnova.Controller;

import lms.learnova.Model.Student;
import lms.learnova.Service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService){
        this.studentService = studentService;
    }

    @GetMapping("/getStudents")
    public List<Student> getStudents() {
        return studentService.getStudents();
    }

    @GetMapping("/searchStudent/{id}")
    public Student getStudentById(@PathVariable Long id) {
        return studentService.getStudentById(id);
    }

    @PostMapping("/registerStudent")
    public ResponseEntity<Student> addStudent(@RequestBody Student student) {
        Student savedStudent = studentService.addStudent(student);
        return ResponseEntity.ok(savedStudent);
    }

    @PutMapping("/updateStudent/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student student) {
        Student updated = studentService.updateStudent(id, student);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/deleteStudent/{id}")
    public ResponseEntity<String> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok("Student deleted successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginStudent(@RequestBody Student student) {
        String loggedInStudent = studentService.verify(student);
        return ResponseEntity.ok(loggedInStudent);
    }
}
