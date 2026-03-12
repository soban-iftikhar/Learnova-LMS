# Learnova LMS - Production Deployment Guide

## System Requirements

- **Java**: JDK 21 or later
- **MySQL**: 8.0 or later
- **RAM**: Minimum 2GB (4GB recommended)
- **Disk**: 10GB for application and database

## Pre-Deployment Checklist

- [ ] MySQL server installed and running on production machine
- [ ] Database user created with proper permissions
- [ ] Environment variables configured on server
- [ ] JWT secret key generated and stored securely
- [ ] Application JAR file built: `Learnova-0.0.1-SNAPSHOT.jar`
- [ ] Database connectivity tested from production server
- [ ] Firewall rules configured to allow port 8080

## Environment Variables Configuration

Set the following environment variables on the production server:

```bash
# Database Configuration (CRITICAL)
export DB_URL=jdbc:mysql://your-mysql-host:3306/learnova?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=false
export DB_USERNAME=learnova_user
export DB_PASSWORD=strong_secure_password_here

# JWT Configuration (CRITICAL - Generate a strong random key)
export JWT_SECRET=your-very-long-random-secret-key-minimum-256-bits-recommended
export JWT_EXPIRATION_MS=86400000

# OAuth2 Configuration (Optional - for future integration)
export OAUTH2_GOOGLE_CLIENT_ID=your-google-client-id
export OAUTH2_GOOGLE_CLIENT_SECRET=your-google-client-secret
export OAUTH2_GITHUB_CLIENT_ID=your-github-client-id
export OAUTH2_GITHUB_CLIENT_SECRET=your-github-client-secret

# Server Configuration (Optional)
export SERVER_PORT=8080
export SERVER_SERVLET_CONTEXT_PATH=/api
```

### Generating JWT Secret Key

```bash
# Option 1: Using OpenSSL
openssl rand -base64 256

# Option 2: Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(256))"

# Option 3: Using Java
java -jar Learnova-0.0.1-SNAPSHOT.jar -cp /path/to/jar java -c "System.out.println(java.util.UUID.randomUUID())"
```

## MySQL Database Setup

### 1. Create Database and User

```sql
-- Connect as MySQL root user
mysql -u root -p

-- Create database
CREATE DATABASE learnova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'learnova_user'@'localhost' IDENTIFIED BY 'strong_secure_password_here';

-- For remote connections (if needed)
CREATE USER 'learnova_user'@'%' IDENTIFIED BY 'strong_secure_password_here';

-- Grant permissions
GRANT ALL PRIVILEGES ON learnova.* TO 'learnova_user'@'localhost';
GRANT ALL PRIVILEGES ON learnova.* TO 'learnova_user'@'%';

-- Apply permissions
FLUSH PRIVILEGES;

-- Verify
SHOW GRANTS FOR 'learnova_user'@'localhost';
```

### 2. Test Database Connection

```bash
# Before starting application
mysql -u learnova_user -p -h your-mysql-host learnova -e "SELECT 1;"

# Expected output: 1
```

### 3. Database Initialization

The application uses Hibernate's `ddl-auto=update` mode, which:
- **Creates** tables on first run if they don't exist
- **Updates** existing tables with schema changes
- **Does NOT drop** data during updates

First run will automatically:
1. Create all 11 entities (User, Student, Instructor, Course, Enrollment, etc.)
2. Create all relationships (foreign keys, indexes)
3. Initialize default data if configured

## Deployment Steps

### Option A: Manual Deployment

```bash
# 1. Create application directory
mkdir -p /opt/learnova
cd /opt/learnova

# 2. Copy JAR file
cp ~/Learnova-0.0.1-SNAPSHOT.jar /opt/learnova/

# 3. Set environment variables in shell profile or systemd service
export DB_URL=jdbc:mysql://localhost:3306/learnova?useSSL=true&serverTimezone=UTC
export DB_USERNAME=learnova_user
export DB_PASSWORD=your_secure_password
export JWT_SECRET=your_jwt_secret_key

# 4. Run application
java -jar Learnova-0.0.1-SNAPSHOT.jar

# Application will be available at http://localhost:8080
```

### Option B: SystemD Service (Recommended)

Create `/etc/systemd/system/learnova.service`:

```ini
[Unit]
Description=Learnova LMS Application
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=learnova
WorkingDirectory=/opt/learnova
EnvironmentFile=/etc/learnova/learnova.env
ExecStart=/usr/bin/java -Xmx2g -Xms1g -jar Learnova-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Create environment file `/etc/learnova/learnova.env`:

```bash
DB_URL=jdbc:mysql://localhost:3306/learnova?useSSL=true&serverTimezone=UTC
DB_USERNAME=learnova_user
DB_PASSWORD=strong_password
JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRATION_MS=86400000
SERVER_PORT=8080
```

Enable and start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable learnova
sudo systemctl start learnova
sudo systemctl status learnova
```

### Option C: Docker Deployment (Production Ready)

Create `Dockerfile`:

```dockerfile
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy JAR
COPY target/Learnova-0.0.1-SNAPSHOT.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD java -cp app.jar org.springframework.boot.loader.Main -jar app.jar health

EXPOSE 8080

ENTRYPOINT ["java", "-Xmx2g", "-Xms1g", "-jar", "app.jar"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: learnova_db
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: learnova
      MYSQL_USER: learnova_user
      MYSQL_PASSWORD: learnova_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  learnova:
    build: ./Backend
    container_name: learnova_app
    environment:
      DB_URL: jdbc:mysql://mysql:3306/learnova?useSSL=false&serverTimezone=UTC
      DB_USERNAME: learnova_user
      DB_PASSWORD: learnova_password
      JWT_SECRET: your-long-random-secret-key-min-256-bits
      JWT_EXPIRATION_MS: 86400000
      SERVER_PORT: 8080
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3

volumes:
  mysql_data:
```

Deploy with Docker:

```bash
docker-compose up -d
docker-compose logs -f learnova
```

## Verification & Testing

### Health Check Endpoint

```bash
curl -X GET http://localhost:8080/api/health
```

### Authentication Test

```bash
# 1. Create initial admin user (first run only)
# Application creates default admin if database is empty

# 2. Login to get JWT token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@learnova.com","password":"admin123"}'

# Response includes JWT token: { "token": "eyJhbGc..." }

# 3. Use token for authenticated requests
curl -X GET http://localhost:8080/api/courses \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Database Connectivity Test

```bash
# Check if application can reach database (check logs)
docker-compose logs learnova | grep -i "database\|connection\|hibernate"

# Expected: "Hibernate ORM core version 6.6.11.Final"
#           "HikariPool - Starting"
#           No error messages about DB connection
```

## SSL/TLS Configuration (Recommended for Production)

Update `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/learnova?useSSL=true&serverTimezone=UTC
```

Or configure Nginx reverse proxy with SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name learnova.example.com;

    ssl_certificate /etc/letsencrypt/live/learnova.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/learnova.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring & Logs

### View Application Logs

```bash
# If running with SystemD
sudo journalctl -u learnova -f

# If running with Docker
docker-compose logs -f learnova

# If running manually
tail -f /opt/learnova/application.log
```

### Key Metrics to Monitor

- Database connection pool status
- Failed authentication attempts
- API response times
- Memory usage (JVM heap)

### Log Levels Configuration

Add to `application.properties` for production:

```properties
logging.level.root=INFO
logging.level.lms.learnova=INFO
logging.level.org.springframework.security=DEBUG
logging.level.org.hibernate.SQL=WARN
```

## Troubleshooting

### Issue: Database Connection Refused

```bash
# Check MySQL is running
sudo systemctl status mysql

# Check MySQL listening on port 3306
sudo netstat -tlnp | grep 3306

# Test connection
mysql -u learnova_user -p -h localhost learnova -e "SELECT 1;"
```

### Issue: "Unknown Database 'learnova'"

```bash
# Database doesn't exist or permissions incorrect
mysql -u root -p -e "SHOW DATABASES LIKE 'learnova';"

# Recreate database and user if needed
```

### Issue: JWT Token Invalid

```bash
# Check JWT_SECRET environment variable is set
echo $JWT_SECRET

# Ensure same secret is used for all instances in cluster
```

### Issue: Out of Memory

```bash
# Increase JVM heap size
java -Xmx4g -Xms2g -jar Learnova-0.0.1-SNAPSHOT.jar
```

## Backup & Recovery

### Database Backup

```bash
# Daily backup
mysqldump -u learnova_user -p learnova > learnova_backup_$(date +%Y%m%d).sql

# Automated backup (add to crontab)
0 2 * * * mysqldump -u learnova_user -pPASSWORD learnova > /backups/learnova_$(date +\%Y\%m\%d).sql
```

### Database Recovery

```bash
mysql -u learnova_user -p learnova < learnova_backup_20240313.sql
```

## Security Hardening

1. **Change default database user password**
   ```sql
   ALTER USER 'learnova_user'@'localhost' IDENTIFIED BY 'new_strong_password';
   ```

2. **Restrict database user permissions**
   ```sql
   REVOKE ALL PRIVILEGES ON *.* FROM 'learnova_user'@'localhost';
   GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX, EXECUTE ON learnova.* TO 'learnova_user'@'localhost';
   ```

3. **Enable MySQL SSL**
   ```sql
   SHOW VARIABLES LIKE '%ssl%';
   ```

4. **Firewall configuration**
   ```bash
   sudo ufw allow 8080/tcp  # For API
   sudo ufw deny 3306/tcp   # Deny direct DB access
   sudo ufw enable
   ```

5. **Application-level security**
   - Rotate JWT_SECRET regularly
   - Enable HTTPS/SSL
   - Set secure cookie flags
   - Implement rate limiting

## Maintenance

### Regular Tasks

- Monitor disk space (database growth)
- Review logs for errors/warnings
- Update Java security patches
- Backup database daily
- Test backup recovery process

### Version Upgrades

1. Build new JAR from updated source
2. Test in staging environment
3. Backup production database
4. Stop current application
5. Deploy new JAR
6. Verify database schema migration
7. Monitor logs for errors

## Performance Tuning

### MySQL Configuration

Add to `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
[mysqld]
max_connections=500
innodb_buffer_pool_size=2G
innodb_log_file_size=512M
query_cache_size=64M
```

### Java JVM Tuning

```bash
java -Xmx4g -Xms2g \
  -XX:+UseG1GC \
  -XX:+ParallelRefProcEnabled \
  -XX:+UnlockDiagnosticVMOptions \
  -XX:G1SummarizeRSetStatsPeriod=1 \
  -jar Learnova-0.0.1-SNAPSHOT.jar
```

## API Documentation

Once deployed, access Swagger UI at:
```
http://your-server:8080/swagger-ui.html
```

Core endpoints:
- **POST** `/api/auth/login` - Authentication
- **GET** `/api/courses` - List courses
- **POST** `/api/enrollment` - Enroll in course
- **GET** `/api/students/{id}/enrollments` - Student enrollments
- **GET** `/api/quiz/{id}` - Get quiz details
- **POST** `/api/quiz/submit` - Submit quiz answers

## Support & Rollback

If issues occur:

1. **Check logs for error messages**
   ```bash
   docker-compose logs learnova | grep -i error
   ```

2. **Rollback to previous version**
   ```bash
   git checkout previous-commit
   ./mvnw clean package -DskipTests
   docker-compose down
   docker-compose up -d
   ```

3. **Restore database from backup**
   ```bash
   mysql -u learnova_user -p learnova < learnova_backup_stable.sql
   ```

---

**Last Updated**: March 2024
**Version**: Learnova 0.0.1-SNAPSHOT
**Contact**: Support team or check GitHub issues
