package lms.learnova.Service;

import lms.learnova.Model.Student;
import lms.learnova.Repository.StudentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepo studentRepo;
    @Autowired
    public StudentService(StudentRepo studentRepo) {
        this.studentRepo = studentRepo;
    }


    public List<Student> getStudents() {
        return studentRepo.findAll();
    }

    public Student addStudent(Student student) {
        return studentRepo.save(student);
    }

    public void deleteStudent(Long id) {
        studentRepo.deleteById(id);
    }

    public Student getStudentById(Long id) {
        return studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student with ID " + id + " not found"));
    }

    public Student updateStudent(Long id, Student student) {
        Student existingStudent = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student with ID " + id + " not found"));

        existingStudent.setName(student.getName());
        existingStudent.setEmail(student.getEmail());
        existingStudent.setPassword(student.getPassword());
        existingStudent.setRegistrationNumber(student.getRegistrationNumber());
        existingStudent.setDegreeProgram(student.getDegreeProgram());
        existingStudent.setEnrollmentDate(student.getEnrollmentDate());
        return studentRepo.save(existingStudent);
    }

    public boolean login(String email, String password) {
        Student student = studentRepo.findByEmail(email);
        if (student != null) {
            return student.getPassword().equals(password);
        }
        return false;
    }

    public Student signup(Student student) {
        if (studentRepo.findByEmail(student.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }
        return studentRepo.save(student);
    }
}
