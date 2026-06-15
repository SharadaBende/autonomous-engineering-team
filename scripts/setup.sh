#!/bin/bash

# Setup script for new developers

# Check if required environment variables are set
if [ -z "$DB_PASSWORD" ] || [ -z "$REDIS_PASSWORD" ]; then
  echo "Please set DB_PASSWORD and REDIS_PASSWORD environment variables"
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Create MySQL database
echo "Creating MySQL database..."
mysql -u root -e "CREATE DATABASE todoapp; GRANT ALL PRIVILEGES ON todoapp.* TO 'todoapp'@'%' IDENTIFIED BY '$DB_PASSWORD'; FLUSH PRIVILEGES;"

# Create Redis database
echo "Creating Redis database..."
redis-cli CONFIG SET requirepass "$REDIS_PASSWORD"

# Build and start Docker containers
echo "Building and starting Docker containers..."
docker-compose up -d --build

# Initialize MySQL database schema
echo "Initializing MySQL database schema..."
docker-compose exec mysql mysql -u todoapp -p"$DB_PASSWORD" todoapp < schema.sql

# Start Redis cache
echo "Starting Redis cache..."
docker-compose exec redis redis-server --requirepass "$REDIS_PASSWORD"

# Start Node.js application
echo "Starting Node.js application..."
docker-compose exec node npm start

echo "Setup complete. Access TodoApp at http://localhost:3000"