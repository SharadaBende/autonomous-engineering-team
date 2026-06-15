import os
import logging
import time
import requests
from prometheus_client import start_http_server, Counter, Gauge, Histogram

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
TODO_APP_URL = os.environ.get('TODO_APP_URL', 'http://localhost:3000')
PROMETHEUS_PORT = int(os.environ.get('PROMETHEUS_PORT', 8000))

# Define metrics
REQUESTS_COUNTER = Counter('todo_app_requests_total', 'Total number of requests')
REQUESTS_LATENCY_HISTOGRAM = Histogram('todo_app_requests_latency_seconds', 'Request latency in seconds')
ERRORS_COUNTER = Counter('todo_app_errors_total', 'Total number of errors')
TASKS_GAUGE = Gauge('todo_app_tasks_total', 'Total number of tasks')

def collect_metrics():
    try:
        # Collect metrics for each endpoint
        endpoints = [
            {'method': 'POST', 'path': '/api/users'},
            {'method': 'POST', 'path': '/api/login'},
            {'method': 'GET', 'path': '/api/tasks'},
            {'method': 'POST', 'path': '/api/tasks'},
            {'method': 'PUT', 'path': '/api/tasks/1'},
            {'method': 'DELETE', 'path': '/api/tasks/1'}
        ]

        for endpoint in endpoints:
            start_time = time.time()
            response = requests.request(endpoint['method'], f"{TODO_APP_URL}{endpoint['path']}")
            end_time = time.time()

            REQUESTS_COUNTER.inc()
            REQUESTS_LATENCY_HISTOGRAM.observe(end_time - start_time)

            if response.status_code >= 400:
                ERRORS_COUNTER.inc()

        # Collect tasks metric
        response = requests.get(f"{TODO_APP_URL}/api/tasks")
        if response.status_code == 200:
            tasks = response.json()
            TASKS_GAUGE.set(len(tasks))

    except Exception as e:
        logger.error(f"Error collecting metrics: {e}")

def main():
    start_http_server(PROMETHEUS_PORT)
    logger.info(f"Prometheus server started on port {PROMETHEUS_PORT}")

    while True:
        collect_metrics()
        time.sleep(60)

if __name__ == '__main__':
    main()