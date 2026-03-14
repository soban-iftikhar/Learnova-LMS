#!/bin/bash

ensure_java_home() {
    if [ -z "$JAVA_HOME" ] || [ ! -x "$JAVA_HOME/bin/java" ]; then
        JAVA_BIN="$(readlink -f "$(command -v java)")"
        export JAVA_HOME="$(dirname "$(dirname "$JAVA_BIN")")"
    fi
}

# Ensure JAVA_HOME is available for mvnw/java execution
ensure_java_home

# Load environment variables from .env file
if [ -f .env ]; then
    set -a
    source .env
    set +a
    echo "✅ Environment variables loaded from .env"
else
    echo "❌ .env file not found!"
    exit 1
fi

# .env might override JAVA_HOME with an invalid path, fix it if needed.
ensure_java_home

# Always rebuild JAR so runtime reflects latest code changes
echo "Building JAR file..."
cd Backend
./mvnw clean package -DskipTests -q
cd ..

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
