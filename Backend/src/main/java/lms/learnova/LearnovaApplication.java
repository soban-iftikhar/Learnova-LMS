package lms.learnova;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LearnovaApplication {
    public static void main(String[] args) {
        SpringApplication.run(LearnovaApplication.class, args);
    }
}
