#!/bin/bash

# Learnova LMS - MySQL Setup Script for Production
# This script sets up the MySQL database and user for production deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
MYSQL_ROOT_USER="${1:-root}"
MYSQL_HOST="${2:-localhost}"
DB_NAME="learnova"
DB_USER="learnova_user"
DB_PASS="${3:-learnova_secure_password_$(date +%s)}"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Learnova LMS - MySQL Production Setup${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}✗ MySQL client is not installed${NC}"
    echo "Install MySQL: sudo apt-get install mysql-server mysql-client"
    exit 1
fi

echo -e "${GREEN}✓ MySQL client found${NC}"

# Prompt for root password
echo -e "\n${YELLOW}Enter MySQL root password:${NC}"
read -s MYSQL_ROOT_PASS

# Test connection
echo -e "\n${BLUE}Testing MySQL connection...${NC}"
if mysql -h "$MYSQL_HOST" -u "$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASS" -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Connected to MySQL successfully${NC}"
else
    echo -e "${RED}✗ Failed to connect to MySQL${NC}"
    echo "Verify MySQL is running: sudo systemctl status mysql"
    exit 1
fi

# Create database
echo -e "\n${BLUE}Creating database '${DB_NAME}'...${NC}"
mysql -h "$MYSQL_HOST" -u "$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASS" -e \
    "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database created successfully${NC}"
else
    echo -e "${RED}✗ Failed to create database${NC}"
    exit 1
fi

# Create user for localhost
echo -e "\n${BLUE}Creating database user '${DB_USER}' for localhost...${NC}"
mysql -h "$MYSQL_HOST" -u "$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASS" -e \
    "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Local user created successfully${NC}"
else
    echo -e "${RED}✗ Failed to create local user${NC}"
    exit 1
fi

# Create user for remote connections (optional)
echo -e "\n${BLUE}Creating database user '${DB_USER}' for remote connections...${NC}"
mysql -h "$MYSQL_HOST" -u "$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASS" -e \
    "CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASS}';" 2>/dev/null || true

echo -e "${GREEN}✓ Remote user created (or already exists)${NC}"

# Grant privileges to localhost user
echo -e "\n${BLUE}Granting privileges to localhost user...${NC}"
mysql -h "$MYSQL_HOST" -u "$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASS" -e \
    "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Privileges granted to localhost user${NC}"
else
    echo -e "${RED}✗ Failed to grant privileges${NC}"
    exit 1
fi

# Grant privileges to remote user
echo -e "\n${BLUE}Granting privileges to remote user...${NC}"
mysql -h "$MYSQL_HOST" -u "$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASS" -e \
    "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'%';" 2>/dev/null || true

echo -e "${GREEN}✓ Privileges granted to remote user${NC}"

# Flush privileges
echo -e "\n${BLUE}Flushing privileges...${NC}"
mysql -h "$MYSQL_HOST" -u "$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASS" -e "FLUSH PRIVILEGES;"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Privileges flushed${NC}"
else
    echo -e "${RED}✗ Failed to flush privileges${NC}"
    exit 1
fi

# Verify user creation
echo -e "\n${BLUE}Verifying user creation...${NC}"
if mysql -h "$MYSQL_HOST" -u "$DB_USER" -p"$DB_PASS" -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ User verification successful${NC}"
else
    echo -e "${RED}✗ User verification failed${NC}"
    exit 1
fi

# Create backup directory
echo -e "\n${BLUE}Creating backup directory...${NC}"
mkdir -p /opt/learnova/backups
echo -e "${GREEN}✓ Backup directory created at /opt/learnova/backups${NC}"

# Display summary
echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  SETUP COMPLETED SUCCESSFULLY${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${GREEN}Database Configuration:${NC}"
echo "  Database Name: $DB_NAME"
echo "  Username: $DB_USER"
echo "  Password: $DB_PASS"
echo "  Host: $MYSQL_HOST"

echo -e "\n${BLUE}Environment Variables to set:${NC}"
echo -e "\n${YELLOW}export DB_URL=jdbc:mysql://${MYSQL_HOST}:3306/${DB_NAME}?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=false${NC}"
echo -e "${YELLOW}export DB_USERNAME=${DB_USER}${NC}"
echo -e "${YELLOW}export DB_PASSWORD=${DB_PASS}${NC}"

echo -e "\n${BLUE}Test the connection:${NC}"
echo -e "${YELLOW}mysql -h ${MYSQL_HOST} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -e \"SELECT 1;\"${NC}"

echo -e "\n${BLUE}Create a backup:${NC}"
echo -e "${YELLOW}mysqldump -h ${MYSQL_HOST} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} > /opt/learnova/backups/backup_\$(date +%Y%m%d_%H%M%S).sql${NC}"

echo -e "\n${GREEN}Next Steps:${NC}"
echo "1. Set the environment variables in your shell or systemd service file"
echo "2. Start the Learnova application: java -jar Learnova-0.0.1-SNAPSHOT.jar"
echo "3. Hibernate will automatically create the schema on first run"
echo "4. Test with: ./test-api.sh"

echo -e "\n${YELLOW}SECURITY NOTE:${NC}"
echo "- Change the database password from the generated one"
echo "- Store passwords in a secure location (e.g., .env file, secrets manager)"
echo "- Enable SSL for MySQL connections in production"
echo "- Restrict database user IP access if possible"
echo "- Enable MySQL general query log to audit access patterns"

echo -e "\n${BLUE}For remote connections, update application.properties:${NC}"
echo -e "${YELLOW}spring.datasource.url=jdbc:mysql://${MYSQL_HOST}:3306/${DB_NAME}?useSSL=true&serverTimezone=UTC${NC}"
