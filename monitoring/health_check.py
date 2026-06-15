import os
import requests
import logging
import time
import json

# Set up logging configuration
logging.basicConfig(
    format='%(asctime)s [%(levelname)s] %(message)s',
    level=logging.INFO,
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Load environment variables
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:8080')
DATABASE_HOST = os.environ.get('DATABASE_HOST', 'localhost')
DATABASE_PORT = int(os.environ.get('DATABASE_PORT', 3306))
CACHE_HOST = os.environ.get('CACHE_HOST', 'localhost')
CACHE_PORT = int(os.environ.get('CACHE_PORT', 6379))

# Define health check functions
def check_frontend():
    try:
        response = requests.get(f'{FRONTEND_URL}/healthcheck', timeout=5)
        if response.status_code == 200:
            logging.info('Frontend is healthy')
            return True
        else:
            logging.error(f'Frontend health check failed with status code {response.status_code}')
            return False
    except requests.exceptions.RequestException as e:
        logging.error(f'Frontend health check failed: {e}')
        return False

def check_backend():
    try:
        response = requests.get(f'{BACKEND_URL}/api/healthcheck', timeout=5)
        if response.status_code == 200:
            logging.info('Backend is healthy')
            return True
        else:
            logging.error(f'Backend health check failed with status code {response.status_code}')
            return False
    except requests.exceptions.RequestException as e:
        logging.error(f'Backend health check failed: {e}')
        return False

def check_database():
    try:
        import mysql.connector
        cnx = mysql.connector.connect(
            user=os.environ.get('DATABASE_USER'),
            password=os.environ.get('DATABASE_PASSWORD'),
            host=DATABASE_HOST,
            port=DATABASE_PORT,
            database=os.environ.get('DATABASE_NAME')
        )
        cnx.close()
        logging.info('Database is healthy')
        return True
    except mysql.connector.Error as e:
        logging.error(f'Database health check failed: {e}')
        return False

def check_cache():
    try:
        import redis
        redis_client = redis.Redis(host=CACHE_HOST, port=CACHE_PORT, db=0)
        redis_client.ping()
        logging.info('Cache is healthy')
        return True
    except redis.exceptions.RedisError as e:
        logging.error(f'Cache health check failed: {e}')
        return False

def main():
    services = {
        'frontend': check_frontend,
        'backend': check_backend,
        'database': check_database,
        'cache': check_cache
    }

    results = {}
    for service, check in services.items():
        results[service] = check()

    logging.info('Health check results:')
    for service, result in results.items():
        logging.info(f'{service}: {result}')

    # Return a non-zero exit code if any service is unhealthy
    if not all(results.values()):
        logging.error('One or more services are unhealthy')
        exit(1)

if __name__ == '__main__':
    main()