package lms.learnova.DTOs;

public class QuizStatisticsDTO {
    private Long quizId;
    private String quizTitle;
    private Integer totalQuestions;
    private Integer maxScore;
    private Double averageScore;
    private Integer totalAttempts;
    private Double passPercentage;

    public QuizStatisticsDTO() {
    }

    public QuizStatisticsDTO(Long quizId, String quizTitle, Integer totalQuestions, 
                            Integer maxScore, Double averageScore, Integer totalAttempts, 
                            Double passPercentage) {
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.totalQuestions = totalQuestions;
        this.maxScore = maxScore;
        this.averageScore = averageScore;
        this.totalAttempts = totalAttempts;
        this.passPercentage = passPercentage;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(Integer maxScore) {
        this.maxScore = maxScore;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public Integer getTotalAttempts() {
        return totalAttempts;
    }

    public void setTotalAttempts(Integer totalAttempts) {
        this.totalAttempts = totalAttempts;
    }

    public Double getPassPercentage() {
        return passPercentage;
    }

    public void setPassPercentage(Double passPercentage) {
        this.passPercentage = passPercentage;
    }
}
