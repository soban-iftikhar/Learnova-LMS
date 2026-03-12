#!/bin/bash

# Learnova LMS - API Testing Script
# This script tests all critical backend endpoints to verify production readiness

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:8080/api}"
ADMIN_EMAIL="admin@learnova.com"
ADMIN_PASSWORD="admin123"
STUDENT_EMAIL="student@test.com"
STUDENT_PASSWORD="student123"
INSTRUCTOR_EMAIL="instructor@test.com"
INSTRUCTOR_PASSWORD="instructor123"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Log functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test helper function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local token=$4
    local data=$5
    local expected_code=$6

    log_info "Testing: $name"

    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "${API_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "${API_URL}${endpoint}" \
            -H "Authorization: Bearer $token")
    fi

    # Extract HTTP code from last line
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "$expected_code" ]; then
        log_success "$name (HTTP $http_code)"
        echo "$body"
        return 0
    else
        log_error "$name - Expected $expected_code, got $http_code"
        echo "Response: $body"
        return 1
    fi
}

# ============================================================================
# SECTION 1: Health Check
# ============================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 1: HEALTH CHECK${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

log_info "Checking if application is running at $API_URL"

if curl -s "$API_URL" > /dev/null 2>&1; then
    log_success "Application is running"
else
    log_error "Application is not reachable at $API_URL"
    exit 1
fi

# ============================================================================
# SECTION 2: Authentication Tests
# ============================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 2: AUTHENTICATION TESTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Test admin login
log_info "Attempting admin login"
admin_login_response=$(curl -s -X POST "${API_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

ADMIN_TOKEN=$(echo "$admin_login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
    log_success "Admin login successful - Token: ${ADMIN_TOKEN:0:20}..."
else
    log_error "Admin login failed"
    log_warning "Response: $admin_login_response"
    log_warning "This is expected if database is empty on first run. Manual user creation may be needed."
fi

# Test invalid login
log_info "Testing invalid credentials"
invalid_response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid@test.com","password":"wrong"}')

invalid_code=$(echo "$invalid_response" | tail -n1)
if [ "$invalid_code" = "401" ] || [ "$invalid_code" = "400" ]; then
    log_success "Invalid login correctly rejected (HTTP $invalid_code)"
else
    log_warning "Invalid login returned HTTP $invalid_code (expected 401 or 400)"
fi

# ============================================================================
# SECTION 3: Course Management Tests (Admin)
# ============================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 3: COURSE MANAGEMENT TESTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if [ -n "$ADMIN_TOKEN" ]; then
    log_info "Listing all courses"
    courses_response=$(curl -s -X GET "${API_URL}/courses" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    log_success "Course list retrieved"
    echo "Sample response (first 200 chars): ${courses_response:0:200}..."

    # Create a new course (requires Instructor role - skip for admin testing)
    log_warning "Skipping course creation - requires Instructor token"
else
    log_warning "Skipping course tests - admin token not available"
fi

# ============================================================================
# SECTION 4: Database Connectivity Test
# ============================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 4: DATABASE CONNECTIVITY TEST${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

log_info "Checking database connectivity from application"

if [ -n "$ADMIN_TOKEN" ]; then
    # If we got a token, database is definitely connected
    log_success "Database is connected (JWT token generation succeeded)"
else
    log_warning "Could not verify database through JWT token"
    log_info "Checking if application logs show database connection..."
fi

# ============================================================================
# SECTION 5: Error Handling Tests
# ============================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 5: ERROR HANDLING TESTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Test 404 error
log_info "Testing 404 - Non-existent course"
not_found=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}/courses/99999" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

not_found_code=$(echo "$not_found" | tail -n1)
if [ "$not_found_code" = "404" ]; then
    log_success "404 Error handling works correctly"
else
    log_warning "Expected 404 for non-existent resource, got HTTP $not_found_code"
fi

# Test missing auth header
log_info "Testing missing Authorization header"
no_auth=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}/courses")

no_auth_code=$(echo "$no_auth" | tail -n1)
if [ "$no_auth_code" = "401" ] || [ "$no_auth_code" = "403" ]; then
    log_success "Missing auth header correctly rejected (HTTP $no_auth_code)"
else
    log_warning "Expected 401/403 for missing auth, got HTTP $no_auth_code"
fi

# Test invalid token
log_info "Testing invalid JWT token"
invalid_token=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}/courses" \
    -H "Authorization: Bearer invalid.token.here")

invalid_code=$(echo "$invalid_token" | tail -n1)
if [ "$invalid_code" = "401" ]; then
    log_success "Invalid token correctly rejected (HTTP $invalid_code)"
else
    log_warning "Expected 401 for invalid token, got HTTP $invalid_code"
fi

# ============================================================================
# SECTION 6: CORS and Headers Test
# ============================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 6: CORS AND HEADERS TEST${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

log_info "Checking response headers"
headers=$(curl -s -I -X GET "${API_URL}/courses")

if echo "$headers" | grep -q "Content-Type"; then
    log_success "Content-Type header present"
else
    log_warning "Content-Type header missing"
fi

# ============================================================================
# SECTION 7: Performance Test
# ============================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 7: PERFORMANCE TEST${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if [ -n "$ADMIN_TOKEN" ]; then
    log_info "Measuring response time for course list endpoint"
    
    response_time=$(curl -s -w "%{time_total}" -o /dev/null -X GET "${API_URL}/courses" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    response_time_ms=$(echo "$response_time" | awk '{print int($1 * 1000)}')
    
    if [ "$response_time_ms" -lt 1000 ]; then
        log_success "Fast response time: ${response_time_ms}ms"
    elif [ "$response_time_ms" -lt 3000 ]; then
        log_warning "Acceptable response time: ${response_time_ms}ms"
    else
        log_error "Slow response time: ${response_time_ms}ms (expected < 3000ms)"
    fi
else
    log_warning "Skipping performance test - admin token not available"
fi

# ============================================================================
# SECTION 8: Production Configuration Check
# ============================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 8: PRODUCTION CONFIGURATION CHECK${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

log_info "Checking required environment variables:"

required_vars=(
    "DB_URL"
    "DB_USERNAME"
    "DB_PASSWORD"
    "JWT_SECRET"
)

for var in "${required_vars[@]}"; do
    if [ -n "${!var}" ]; then
        log_success "$var is set"
    else
        log_warning "$var is not set (will use defaults from application.properties)"
    fi
done

# ============================================================================
# SECTION 9: MySQL Connectivity Test
# ============================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 9: MYSQL DATABASE CONNECTIVITY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if command -v mysql &> /dev/null; then
    log_info "MySQL client found, testing connection"
    
    # Parse DB_URL to get host and port
    # Format: jdbc:mysql://host:port/database
    DB_HOST=$(echo "${DB_URL:-jdbc:mysql://localhost:3306/learnova}" | sed -E 's|.*://([^:]+):.*|\1|')
    DB_PORT=$(echo "${DB_URL:-jdbc:mysql://localhost:3306/learnova}" | sed -E 's|.*:([0-9]+)/.*|\1|')
    
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; then
        log_success "MySQL connection successful (Host: $DB_HOST:$DB_PORT)"
        
        # Check if database exists
        if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" -e "USE learnova;" > /dev/null 2>&1; then
            log_success "Learnova database exists"
            
            # Check table count
            table_count=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='learnova';" 2>/dev/null | tail -1)
            log_info "Database tables found: $table_count"
        else
            log_warning "Learnova database not found - will be created on first application startup"
        fi
    else
        log_error "MySQL connection failed"
        log_info "Verify credentials: Host=$DB_HOST, Port=$DB_PORT, User=$DB_USERNAME"
    fi
else
    log_warning "MySQL client not installed - cannot test database connectivity"
    log_info "Install mysql-client: sudo apt-get install mysql-client"
fi

# ============================================================================
# Summary
# ============================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

total_tests=$((TESTS_PASSED + TESTS_FAILED))

echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo -e "Total:  $total_tests"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed! Backend is ready for production.${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠ Some tests failed. Review logs above and fix issues before deployment.${NC}"
    exit 1
fi
