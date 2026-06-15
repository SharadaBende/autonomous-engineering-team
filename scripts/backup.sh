#!/bin/bash

# Set database credentials from environment variables
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
BACKUP_DIR=${BACKUP_DIR}

# Set current date and time for backup file name
CURRENT_DATE=$(date +"%Y-%m-%d-%H-%M-%S")

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
  mkdir -p "$BACKUP_DIR"
fi

# Dump database to SQL file
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_DIR/todoapp-$CURRENT_DATE.sql"

# Compress SQL file
gzip "$BACKUP_DIR/todoapp-$CURRENT_DATE.sql"

# Remove backups older than 7 days
find "$BACKUP_DIR" -type f -name "todoapp-*.sql.gz" -mtime +7 -delete

# Verify if backup was successful
if [ -f "$BACKUP_DIR/todoapp-$CURRENT_DATE.sql.gz" ]; then
  echo "Database backup successful: $BACKUP_DIR/todoapp-$CURRENT_DATE.sql.gz"
else
  echo "Database backup failed"
  exit 1
fi