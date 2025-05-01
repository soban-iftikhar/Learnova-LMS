package lms.learnova.Service;

import lms.learnova.DTOs.CreateCourseRequest;
import lms.learnova.DTOs.UpdateCourseRequest;
import lms.learnova.Model.Course;
import lms.learnova.Model.Instructor;
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
      return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course with ID " + id + " not found"));
    }

    @Autowired
    private InstructorService instructorService;
    public Course addCourse(CreateCourseRequest request) {
        Instructor instructor = instructorService.getInstructorById(request.getInstructorId());
        if (instructor == null) {
            throw new RuntimeException("Instructor with ID " + request.getInstructorId() + " not found");
        }

        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setCategory(request.getCategory());
        course.setInstructor(instructor);

        return courseRepository.save(course);
    }


    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }


    public Course searchCourseByTitle(String title) {
        return courseRepository.findByTitle(title);
    }

    public Course updateCourse(Long courseId, UpdateCourseRequest request) {
        Course existingCourse = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course with ID " + courseId + " not found"));

        existingCourse.setTitle(request.getTitle());
        existingCourse.setDescription(request.getDescription());
        existingCourse.setCategory(request.getCategory());

        if (request.getInstructorId() != null) {
            Instructor instructor = instructorService.getInstructorById(request.getInstructorId());
            existingCourse.setInstructor(instructor);
        }

        return courseRepository.save(existingCourse);
    }

}
