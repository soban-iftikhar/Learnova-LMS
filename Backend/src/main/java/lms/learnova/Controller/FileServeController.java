package lms.learnova.Controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * Serves uploaded submission files.
 * GET /files/{filename}
 */
@RestController
public class FileServeController {

    private static final String UPLOAD_DIR = System.getProperty("java.io.tmpdir") + "/learnova-uploads/";

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            String decoded = URLDecoder.decode(filename, StandardCharsets.UTF_8);
            File file = new File(UPLOAD_DIR + decoded);
            if (!file.exists() || !file.isFile()) {
                return ResponseEntity.notFound().build();
            }
            Resource resource = new FileSystemResource(file);
            String contentType = "application/octet-stream";
            try {
                contentType = java.nio.file.Files.probeContentType(file.toPath());
                if (contentType == null) contentType = "application/octet-stream";
            } catch (Exception ignored) {}
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + file.getName() + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .contentLength(file.length())
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
