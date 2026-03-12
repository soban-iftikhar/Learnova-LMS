package lms.learnova.Service;

import lms.learnova.DTOs.CourseContentDTO;
import lms.learnova.Model.*;
import lms.learnova.Repository.CourseContentRepo;
import lms.learnova.Repository.CourseRepo;
import lms.learnova.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseContentService {
    private final CourseContentRepo contentRepo;
    private final CourseRepo courseRepo;

    public CourseContentService(CourseContentRepo contentRepo, CourseRepo courseRepo) {
        this.contentRepo = contentRepo;
        this.courseRepo = courseRepo;
    }

    // Get all course content ordered by upload sequence
    public List<CourseContent> getCourseMaterials(Long courseId) {
        return contentRepo.findByCourseIdOrderByOrderIndex(courseId);
    }

    // Get published course content only
    public List<CourseContent> getPublishedCourseMaterials(Long courseId) {
        return getCourseMaterials(courseId).stream()
                .filter(CourseContent::getIsPublished)
                .collect(Collectors.toList());
    }

    // Get videos for a course
    public List<Video> getVideosByCourse(Long courseId) {
        return getCourseMaterials(courseId).stream()
                .filter(content -> content instanceof Video)
                .map(content -> (Video) content)
                .collect(Collectors.toList());
    }

    // Get PDFs for a course
    public List<PDF> getPDFsByourse(Long courseId) {
        return getCourseMaterials(courseId).stream()
                .filter(content -> content instanceof PDF)
                .map(content -> (PDF) content)
                .collect(Collectors.toList());
    }

    // Get assignments (PDFs marked as assignments)
    public List<PDF> getAssignmentsByourse(Long courseId) {
        return getPDFsByourse(courseId).stream()
                .filter(PDF::getIsAssignment)
                .collect(Collectors.toList());
    }

    // Get content by ID
    public CourseContent getContentById(Long contentId) {
        return contentRepo.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));
    }

    // Convert to DTO
    public CourseContentDTO convertToDTO(CourseContent content) {
        CourseContentDTO dto = new CourseContentDTO();
        dto.setId(content.getId());
        dto.setTitle(content.getTitle());
        dto.setDescription(content.getDescription());
        dto.setFilePath(content.getFilePath());
        dto.setFileSize(content.getFileSize());
        dto.setUploadedAt(content.getUploadedAt());
        
        if (content instanceof Video) {
            dto.setContentType("VIDEO");
        } else if (content instanceof PDF) {
            dto.setContentType("PDF");
        }
        
        return dto;
    }

    // Get course materials as DTOs
    public List<CourseContentDTO> getCourseMaterialsAsDTO(Long courseId) {
        return getPublishedCourseMaterials(courseId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
