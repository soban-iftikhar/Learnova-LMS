package lms.learnova.Service;

import lms.learnova.DTOs.CourseContentDTO;
import lms.learnova.Model.*;
import lms.learnova.Repository.CourseContentRepo;
import lms.learnova.Repository.CourseRepo;
import lms.learnova.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

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

    public List<CourseContent> getCourseMaterials(Long courseId) {
        return contentRepo.findByCourseIdOrderByOrderIndex(courseId);
    }

    public List<CourseContent> getPublishedCourseMaterials(Long courseId) {
        return getCourseMaterials(courseId).stream()
                .filter(CourseContent::getIsPublished)
                .collect(Collectors.toList());
    }

    public List<Video> getVideosByCourse(Long courseId) {
        return getCourseMaterials(courseId).stream()
                .filter(c -> c instanceof Video)
                .map(c -> (Video) c)
                .collect(Collectors.toList());
    }

    public List<PDF> getPDFsByCourse(Long courseId) {
        return getCourseMaterials(courseId).stream()
                .filter(c -> c instanceof PDF)
                .map(c -> (PDF) c)
                .collect(Collectors.toList());
    }

    public CourseContent getContentById(Long contentId) {
        return contentRepo.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + contentId));
    }

    /**
     * Full DTO conversion — populates all type-specific fields
     * so controllers can forward them to the frontend without null gaps.
     */
    public CourseContentDTO convertToDTO(CourseContent content) {
        CourseContentDTO dto = new CourseContentDTO();
        dto.setId(content.getId());
        dto.setTitle(content.getTitle());
        dto.setDescription(content.getDescription());
        dto.setFilePath(content.getFilePath());
        dto.setFileSize(content.getFileSize());
        dto.setUploadedAt(content.getUploadedAt());
        dto.setOrderIndex(content.getOrderIndex());
        dto.setIsPublished(content.getIsPublished());

        if (content instanceof Video v) {
            dto.setContentType("VIDEO");
            dto.setVideoUrl(v.getVideoUrl());
            dto.setDurationMinutes(v.getDurationMinutes());
            dto.setThumbnailPath(v.getThumbnailPath());
        } else if (content instanceof PDF p) {
            dto.setContentType("PDF");
            dto.setPageCount(p.getPageCount());
            dto.setVideoUrl(null);
        }

        return dto;
    }

    public List<CourseContentDTO> getCourseMaterialsAsDTO(Long courseId) {
        return getPublishedCourseMaterials(courseId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
