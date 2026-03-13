#!/bin/bash

# Get the parent directory (project root)
PROJECT_ROOT="$(dirname "$(pwd)")"

# Load environment variables from .env file in project root
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from .env"
else
    echo "❌ .env file not found at $PROJECT_ROOT/.env"
    exit 1
fi

# Check if JAR exists
JAR_FILE="$PROJECT_ROOT/Backend/target/Learnova-0.0.1-SNAPSHOT.jar"
if [ ! -f "$JAR_FILE" ]; then
    echo "Building JAR file..."
    ./mvnw clean package -DskipTests -q
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          Starting Learnova LMS Backend                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Database: $DB_URL"
echo "User: $DB_USERNAME"
echo "Server: http://localhost:$SERVER_PORT"
echo ""
echo "Starting in 3 seconds..."
sleep 3

# Run the application
java -Xmx2g -Xms1g -jar "$JAR_FILE"
