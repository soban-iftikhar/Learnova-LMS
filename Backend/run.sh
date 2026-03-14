#!/bin/bash

ensure_java_home() {
    if [ -z "$JAVA_HOME" ] || [ ! -x "$JAVA_HOME/bin/java" ]; then
        JAVA_BIN="$(readlink -f "$(command -v java)")"
        export JAVA_HOME="$(dirname "$(dirname "$JAVA_BIN")")"
    fi
}

# Ensure JAVA_HOME is available for mvnw/java execution
ensure_java_home

# Get the parent directory (project root)
PROJECT_ROOT="$(dirname "$(pwd)")"

# Prefer Backend/.env after consolidation, fallback to project root .env.
if [ -f "./.env" ]; then
    export $(cat "./.env" | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from Backend/.env"
elif [ -f "$PROJECT_ROOT/.env" ]; then
    export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from $PROJECT_ROOT/.env"
else
    echo "❌ .env file not found at ./.env or $PROJECT_ROOT/.env"
    exit 1
fi

# .env might override JAVA_HOME with an invalid path, fix it if needed.
ensure_java_home

# Always rebuild JAR so runtime reflects latest code changes
JAR_FILE="$PROJECT_ROOT/Backend/target/Learnova-0.0.1-SNAPSHOT.jar"
echo "Building JAR file..."
./mvnw clean package -DskipTests -q

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
