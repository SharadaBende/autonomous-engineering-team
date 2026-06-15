import os
import logging
import requests
import json
from prometheus_client import start_http_server, Counter, Gauge, Histogram
from prometheus_client.exposition import generate_latest

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
TODO_APP_URL = os.environ.get('TODO_APP_URL', 'http://localhost:3000')
PROMETHEUS_PORT = int(os.environ.get('PROMETHEUS_PORT', 8000))

# Define Prometheus metrics
REQUESTS_COUNTER = Counter('todo_app_requests_total', 'Total number of requests')
REQUESTS_LATENCY = Histogram('todo_app_requests_latency_seconds', 'Request latency in seconds')
ERRORS_COUNTER = Counter('todo_app_errors_total', 'Total number of errors')
TASKS_GAUGE = Gauge('todo_app_tasks', 'Number of tasks')

def get_tasks():
    try:
        response = requests.get(f'{TODO_APP_URL}/api/tasks')
        response.raise_for_status()
        return len(response.json())
    except requests.RequestException as e:
        logger.error(f'Error fetching tasks: {e}')
        return 0

def monitor_tasks():
    tasks = get_tasks()
    TASKS_GAUGE.set(tasks)

def monitor_api_endpoints():
    api_endpoints = [
        {'method': 'POST', 'path': '/api/users', 'description': 'Create a new user'},
        {'method': 'POST', 'path': '/api/login', 'description': 'Log in a user'},
        {'method': 'GET', 'path': '/api/tasks', 'description': 'Get all tasks'},
        {'method': 'POST', 'path': '/api/tasks', 'description': 'Create a new task'},
        {'method': 'PUT', 'path': '/api/tasks/1', 'description': 'Edit a task'},
        {'method': 'DELETE', 'path': '/api/tasks/1', 'description': 'Delete a task'}
    ]

    for endpoint in api_endpoints:
        try:
            method = endpoint['method'].lower()
            if method == 'post':
                response = requests.post(f'{TODO_APP_URL}{endpoint["path"]}')
            elif method == 'get':
                response = requests.get(f'{TODO_APP_URL}{endpoint["path"]}')
            elif method == 'put':
                response = requests.put(f'{TODO_APP_URL}{endpoint["path"]}')
            elif method == 'delete':
                response = requests.delete(f'{TODO_APP_URL}{endpoint["path"]}')

            response.raise_for_status()
            REQUESTS_COUNTER.inc()
            REQUESTS_LATENCY.observe(response.elapsed.total_seconds())
        except requests.RequestException as e:
            logger.error(f'Error monitoring API endpoint {endpoint["path"]}: {e}')
            ERRORS_COUNTER.inc()

def main():
    start_http_server(PROMETHEUS_PORT)
    logger.info(f'Monitoring dashboard started on port {PROMETHEUS_PORT}')

    while True:
        monitor_tasks()
        monitor_api_endpoints()

if __name__ == '__main__':
    main()