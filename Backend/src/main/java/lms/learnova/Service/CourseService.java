package lms.learnova.Service;

import lms.learnova.DTOs.CreateCourseRequest;
import lms.learnova.DTOs.UpdateCourseRequest;
import lms.learnova.exception.ResourceNotFoundException;
import lms.learnova.Model.Course;
import lms.learnova.Model.Instructor;
import lms.learnova.Repository.CourseRepo;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CourseService {


    private final CourseRepo courseRepository;
    private final InstructorService instructorService;

    public CourseService(CourseRepo courseRepository, InstructorService instructorService) {
        this.courseRepository = courseRepository;
        this.instructorService = instructorService;
    }

    public List<Course> getAllCourses() {
      return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Course id is required");
        }
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + id + " not found"));
    }

    public Course addCourse(CreateCourseRequest request) {
        Instructor instructor = instructorService.getInstructorById(request.getInstructorId());

        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setCategory(request.getCategory());
        course.setInstructor(instructor);

        return courseRepository.save(course);
    }


    public void deleteCourse(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Course id is required");
        }
        courseRepository.deleteById(id);
    }


    public Course searchCourseByTitle(String title) {
        Course course = courseRepository.findByTitle(title);
        if (course == null) {
            throw new ResourceNotFoundException("Course with title '" + title + "' not found");
        }
        return course;
    }

    public Course updateCourse(Long courseId, UpdateCourseRequest request) {
        if (courseId == null) {
            throw new IllegalArgumentException("Course id is required");
        }
        Course existingCourse = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + courseId + " not found"));

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
