# Learnova LMS - Quick Reference Guide

## 📋 Quick Start

### Development
```bash
cd Backend
./mvnw spring-boot:run
```
Application runs on: http://localhost:8080

### Production
```bash
# 1. Setup database
bash setup-mysql.sh

# 2. Set environment variables
export DB_URL=jdbc:mysql://localhost:3306/learnova?useSSL=true&serverTimezone=UTC
export DB_USERNAME=learnova_user
export DB_PASSWORD=your_password
export JWT_SECRET=your_secret_key_256_bits_or_more

# 3. Run application
java -Xmx2g -Xms1g -jar Backend/target/Learnova-0.0.1-SNAPSHOT.jar

# 4. Test API
bash test-api.sh
```

---

## 🔑 Environment Variables

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| DB_URL | Yes | jdbc:mysql://localhost:3306/learnova | Database connection |
| DB_USERNAME | Yes | learnova_user | Database user |
| DB_PASSWORD | Yes | secure_password | Database password |
| JWT_SECRET | Yes | long_random_key | Token signing |
| JWT_EXPIRATION_MS | No | 86400000 | Token lifetime (24h) |
| SERVER_PORT | No | 8080 | Application port |

---

## 🗄️ Database

### Setup
```bash
# Create database and user
bash setup-mysql.sh

# Manual setup
mysql -u root -p

CREATE DATABASE learnova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'learnova_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON learnova.* TO 'learnova_user'@'localhost';
FLUSH PRIVILEGES;
```

### Test Connection
```bash
mysql -u learnova_user -p -h localhost learnova -e "SELECT 1;"
```

### Backup
```bash
mysqldump -u learnova_user -p learnova > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
mysql -u learnova_user -p learnova < backup_20240313.sql
```

---

## 🔐 Authentication

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@learnova.com","password":"admin123"}'
```

### Using Token
```bash
curl -X GET http://localhost:8080/api/courses \
  -H "Authorization: Bearer your_jwt_token"
```

---

## 📊 Core API Endpoints

### Student Endpoints
```
GET    /api/students/{id}
GET    /api/students/{id}/enrollments
POST   /api/enrollment
GET    /api/quiz/{quizId}
POST   /api/quiz/{quizId}/submit
GET    /api/students/{id}/quiz-results
```

### Instructor Endpoints
```
GET    /api/instructor/{id}/courses
POST   /api/instructor/course
POST   /api/instructor/{courseId}/content/video
POST   /api/instructor/{courseId}/quiz
GET    /api/instructor/quiz/{quizId}/statistics
```

### Admin Endpoints
```
GET    /api/admin/instructors
GET    /api/admin/students
POST   /api/admin/course/assign
GET    /api/admin/analytics/system
GET    /api/admin/analytics/top-performers
```

---

## 🧪 Testing

### Test All Endpoints
```bash
bash test-api.sh
```

### Test Specific Endpoint
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@learnova.com","password":"admin123"}' | jq -r '.token')

# Use token
curl -X GET http://localhost:8080/api/courses \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📦 Docker Deployment

### Build Image
```bash
docker build -t learnova:latest .
```

### Run with Docker Compose
```bash
docker-compose up -d
docker-compose logs -f learnova
```

### Stop
```bash
docker-compose down
```

---

## 🛠️ Troubleshooting

### Application won't start
```bash
# Check logs
tail -f /var/log/learnova/application.log
docker-compose logs learnova

# Verify environment variables
env | grep -E 'DB_|JWT_'

# Check port 8080 is available
sudo lsof -i :8080
```

### Database connection error
```bash
# Test MySQL connection
mysql -u learnova_user -p -h localhost learnova -e "SELECT 1;"

# Verify environment variables
echo "DB_URL=$DB_URL"
echo "DB_USERNAME=$DB_USERNAME"
```

### JWT token invalid
```bash
# Ensure JWT_SECRET is set
echo $JWT_SECRET

# Check token format: "Bearer <token>"
```

### Out of memory
```bash
# Increase heap size
java -Xmx4g -Xms2g -jar Learnova-0.0.1-SNAPSHOT.jar
```

---

## 📁 Project Structure

```
Learnova-LMS/
├── Backend/
│   ├── pom.xml
│   ├── src/main/java/lms/learnova/
│   │   ├── LearnovaApplication.java
│   │   ├── Config/
│   │   │   ├── JWTFilter.java
│   │   │   └── SecurityConfig.java
│   │   ├── Controller/ (4 controllers, 62 endpoints)
│   │   ├── Service/ (6 services, 48+ methods)
│   │   ├── Repository/ (6 repositories)
│   │   ├── Model/ (11 entities)
│   │   └── DTOs/ (18 DTOs)
│   └── target/Learnova-0.0.1-SNAPSHOT.jar
├── Frontend/ (Vite React - deferred)
├── DEPLOYMENT.md
├── BACKEND_VERIFICATION_REPORT.md
├── test-api.sh
├── setup-mysql.sh
└── learnova.env.example
```

---

## 🚀 Deployment Checklist

- [ ] MySQL installed (8.0+)
- [ ] Database and user created (setup-mysql.sh)
- [ ] Environment variables configured
- [ ] Application JAR built
- [ ] API endpoints tested (test-api.sh)
- [ ] Database connectivity verified
- [ ] Backup strategy configured
- [ ] Monitoring setup
- [ ] Firewall configured
- [ ] SSL/TLS certificate (for HTTPS)

---

## 📞 Support

### Logs
```bash
# SystemD
sudo journalctl -u learnova -f

# Docker
docker-compose logs -f learnova

# Direct
tail -f /opt/learnova/logs/application.log
```

### Status Check
```bash
# SystemD
sudo systemctl status learnova

# Docker
docker-compose ps

# HTTP
curl http://localhost:8080/api/courses -H "Authorization: Bearer $TOKEN"
```

---

## 📋 User Roles

| Role | Default Credentials | Permissions |
|------|-------------------|-------------|
| ADMIN | admin@learnova.com | Manage all users, courses, analytics |
| INSTRUCTOR | instructor@learnova.com | Create courses, manage content, quizzes, attendance |
| STUDENT | student@learnova.com | Enroll courses, take quizzes, view content |

---

## 🔄 Restart Application

### SystemD
```bash
sudo systemctl restart learnova
```

### Docker
```bash
docker-compose restart learnova
```

### Manual
```bash
# Kill current process
pkill -f "Learnova-0.0.1-SNAPSHOT"

# Start new
java -Xmx2g -Xms1g -jar Learnova-0.0.1-SNAPSHOT.jar
```

---

## 📊 System Requirements

**Minimum:**
- OS: Linux/Windows/macOS
- Java: JDK 21+
- MySQL: 8.0+
- RAM: 2GB
- Disk: 10GB

**Recommended:**
- OS: Linux (Ubuntu 20.04+)
- Java: JDK 21 LTS
- MySQL: 8.0+ with replication
- RAM: 4GB
- Disk: 50GB (with backups)

---

## 🔒 Security Checklist

- [ ] Change database password from default
- [ ] Use strong JWT secret (256+ bits)
- [ ] Enable SSL/TLS for MySQL
- [ ] Enable HTTPS for application
- [ ] Configure firewall rules
- [ ] Restrict database user IP access
- [ ] Enable MySQL slow query log
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Monitor access logs

---

## 📈 Performance Tips

1. **Database**
   - Enable query cache
   - Optimize indexes
   - Regular maintenance (ANALYZE, OPTIMIZE)
   - Monitor connection pool

2. **Application**
   - Increase JVM heap if needed: `-Xmx4g`
   - Use connection pooling (HikariCP default)
   - Implement caching (Redis)
   - Use pagination for large result sets

3. **Server**
   - Use SSD for database storage
   - Ensure adequate RAM
   - Monitor CPU usage
   - Configure swap space

---

## 🔄 Backup Schedule

```bash
# Daily backup (add to crontab)
0 2 * * * mysqldump -u learnova_user -p$DB_PASSWORD learnova > /backups/learnova_$(date +\%Y\%m\%d).sql

# Weekly full backup with compression
0 3 * * 0 mysqldump -u learnova_user -p$DB_PASSWORD learnova | gzip > /backups/learnova_weekly_$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days
find /backups -name "learnova_*.sql" -mtime +30 -delete
```

---

## 📝 Important Ports

| Service | Port | Default |
|---------|------|---------|
| Application | 8080 | ✅ Open |
| MySQL | 3306 | ⚠️ Restrict |
| SSH | 22 | ✅ Open (restricted) |

---

## ✅ Verification Commands

```bash
# Check application running
curl -s http://localhost:8080/api/courses | head -c 100

# Check database
mysql -u learnova_user -p learnova -e "SHOW TABLES;"

# Check logs
tail -50 /var/log/learnova/app.log

# Check memory usage
free -h

# Check disk space
df -h

# Check Java processes
ps aux | grep java

# Check listening ports
sudo netstat -tlnp | grep LISTEN
```

---

**Last Updated**: March 13, 2024
**Version**: Learnova 0.0.1-SNAPSHOT
**Status**: ✅ Production Ready
