package lms.learnova.Service;

import lms.learnova.Model.Student;
import lms.learnova.Repository.StudentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);

    private final StudentRepo studentRepo;
    @Autowired
    public StudentService(StudentRepo studentRepo) {
        this.studentRepo = studentRepo;
    }


    public List<Student> getStudents() {
        return studentRepo.findAll();
    }

    public Student addStudent(Student student) {
        student.setPassword(bCryptPasswordEncoder.encode(student.getPassword()));
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

        if (!bCryptPasswordEncoder.matches(student.getPassword(), existingStudent.getPassword())) {
            existingStudent.setPassword(bCryptPasswordEncoder.encode(student.getPassword()));
        }

        existingStudent.setRegistrationNumber(student.getRegistrationNumber());
        existingStudent.setDegreeProgram(student.getDegreeProgram());

        return studentRepo.save(existingStudent);
    }


}
