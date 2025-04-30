package lms.learnova.Service;

import lms.learnova.Model.Course;
import lms.learnova.Repository.CourseRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CourseService {


    private final CourseRepo courseRepository;

    @Autowired
    public CourseService(CourseRepo courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<Course> getAllCourses() {
        try {
            return courseRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Error fetching courses: " + e.getMessage());
        }
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course with ID " + id + " not found"));
    }

    public Course addCourse(Course course) {
        return courseRepository.save(course);
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }


    public Course searchCourseByTitle(String title) {
        return courseRepository.findByTitle(title);
    }

    public List<Course> searchCourseByCategory(String category) {
        return courseRepository.findByCategory(category);
    }

    public List<Course> getCoursesByInstructor(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }

    public List<String> getEnrolledStudents(Long courseId) {
        return courseRepository.findEnrolledStudentsByCourseId(courseId);
    }

    public void enrollStudent(Long courseId, Long studentId) {
        courseRepository.enrollStudent(courseId, studentId);
    }

    public void unrollStudent(Long courseId, Long studentId) {
        courseRepository.unrollStudent(courseId, studentId);
    }

    public Course updateCourse(long id, Course course) {
        Course existingCourse = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course with ID " + id + " not found"));

        existingCourse.setTitle(course.getTitle());
        existingCourse.setDescription(course.getDescription());
        existingCourse.setCategory(course.getCategory());
        existingCourse.setInstructor(course.getInstructor());
        existingCourse.setEnrolledStudents(course.getEnrolledStudents());

        return courseRepository.save(existingCourse);
    }
}
