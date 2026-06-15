#!/bin/bash

# Set environment variables
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-password}
DB_NAME=${DB_NAME:-todoapp}
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}
REDIS_PASSWORD=${REDIS_PASSWORD:-password}

# Build and deploy frontend
echo "Building and deploying frontend..."
cd frontend
npm install
npm run build
cd ..

# Build and deploy backend
echo "Building and deploying backend..."
cd backend
npm install
npm run build
cd ..

# Build Docker images
echo "Building Docker images..."
docker build -t todoapp-frontend ./frontend
docker build -t todoapp-backend ./backend
docker build -t todoapp-mysql ./mysql
docker build -t todoapp-redis ./redis

# Deploy Docker containers
echo "Deploying Docker containers..."
docker-compose up -d

# Wait for MySQL to start
echo "Waiting for MySQL to start..."
while ! docker exec -it todoapp-mysql mysql -h localhost -u $DB_USER -p$DB_PASSWORD -e "SHOW DATABASES;" > /dev/null 2>&1; do
  sleep 1
done

# Initialize MySQL database
echo "Initializing MySQL database..."
docker exec -it todoapp-mysql mysql -h localhost -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

# Wait for Redis to start
echo "Waiting for Redis to start..."
while ! docker exec -it todoapp-redis redis-cli -h localhost -p $REDIS_PORT PING > /dev/null 2>&1; do
  sleep 1
done

# Configure Redis password
echo "Configuring Redis password..."
docker exec -it todoapp-redis redis-cli -h localhost -p $REDIS_PORT CONFIG SET requirepass $REDIS_PASSWORD

# Start backend container
echo "Starting backend container..."
docker-compose exec todoapp-backend npm start

# Start frontend container
echo "Starting frontend container..."
docker-compose exec todoapp-frontend npm start