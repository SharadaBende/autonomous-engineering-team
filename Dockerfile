# Dockerfile for TodoApp
# Stage 1: Build the React frontend
FROM node:14 as frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build the Node.js backend
FROM node:14 as backend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 3: Build the MySQL database
FROM mysql:8 as database
ENV MYSQL_ROOT_PASSWORD=password
ENV MYSQL_DATABASE=todoapp
ENV MYSQL_USER=user
ENV MYSQL_PASSWORD=password

# Stage 4: Build the Redis cache
FROM redis:6 as cache

# Stage 5: Build the final Docker image
FROM node:14 as final
WORKDIR /app
COPY --from=frontend /app/build /app/frontend
COPY --from=backend /app /app/backend
EXPOSE 3000
CMD ["npm", "start"]

# Copy the Dockerfile for the MySQL database
FROM mysql:8 as mysql
ENV MYSQL_ROOT_PASSWORD=password
ENV MYSQL_DATABASE=todoapp
ENV MYSQL_USER=user
ENV MYSQL_PASSWORD=password
EXPOSE 3306

# Copy the Dockerfile for the Redis cache
FROM redis:6 as redis
EXPOSE 6379

# Create a Docker Compose file to manage the services
# docker-compose.yml
# version: '3'
# services:
#   frontend:
#     build: .
#     ports:
#       - "3000:3000"
#     depends_on:
#       - backend
#       - database
#       - cache
#   backend:
#     build: .
#     ports:
#       - "3001:3001"
#     depends_on:
#       - database
#       - cache
#   database:
#     build: .
#     environment:
#       - MYSQL_ROOT_PASSWORD=password
#       - MYSQL_DATABASE=todoapp
#       - MYSQL_USER=user
#       - MYSQL_PASSWORD=password
#     ports:
#       - "3306:3306"
#   cache:
#     build: .
#     ports:
#       - "6379:6379"

# Create a Docker Compose file to manage the services
# But we will use the following command to build and run the image
# docker build -t todoapp .
# docker run -p 3000:3000 todoapp

# However, the above Dockerfile is not suitable for production
# We should separate the services into different Dockerfiles
# And use Docker Compose to manage the services

# Here is the corrected Dockerfile for the final image
FROM node:14 as final
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# And here are the separate Dockerfiles for the services
# Dockerfile.backend
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]

# Dockerfile.database
FROM mysql:8
ENV MYSQL_ROOT_PASSWORD=password
ENV MYSQL_DATABASE=todoapp
ENV MYSQL_USER=user
ENV MYSQL_PASSWORD=password
EXPOSE 3306

# Dockerfile.cache
FROM redis:6
EXPOSE 6379

# And here is the Docker Compose file to manage the services
# docker-compose.yml
version: '3'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - backend
      - database
      - cache
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    depends_on:
      - database
      - cache
  database:
    build:
      context: .
      dockerfile: Dockerfile.database
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=todoapp
      - MYSQL_USER=user
      - MYSQL_PASSWORD=password
    ports:
      - "3306:3306"
  cache:
    build:
      context: .
      dockerfile: Dockerfile.cache
    ports:
      - "6379:6379"