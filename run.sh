#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from .env"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Check if JAR exists
if [ ! -f Backend/target/Learnova-0.0.1-SNAPSHOT.jar ]; then
    echo "Building JAR file..."
    cd Backend
    ./mvnw clean package -DskipTests -q
    cd ..
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
java -Xmx2g -Xms1g -jar Backend/target/Learnova-0.0.1-SNAPSHOT.jar
