import os
import logging
from datetime import datetime, timedelta
from typing import Dict
import requests
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
PROMETHEUS_URL = os.environ.get('PROMETHEUS_URL', 'http://localhost:9090')
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')
PAGERDUTY_API_KEY = os.environ.get('PAGERDUTY_API_KEY')
PAGERDUTY_SERVICE_ID = os.environ.get('PAGERDUTY_SERVICE_ID')

# Define alert rules
ALERT_RULES = {
    'node_cpu_usage': {
        'query': '100 - (100 * idle)',
        'threshold': 80,
        'description': 'Node CPU usage is high'
    },
    'node_memory_usage': {
        'query': '100 - (100 * (1 - used / total))',
        'threshold': 80,
        'description': 'Node memory usage is high'
    },
    'redis_memory_usage': {
        'query': 'used_memory / total_memory * 100',
        'threshold': 80,
        'description': 'Redis memory usage is high'
    },
    'mysql_connections': {
        'query': 'connections',
        'threshold': 100,
        'description': 'MySQL connections are high'
    },
    'todoapp_api_errors': {
        'query': 'rate(errors[1m])',
        'threshold': 10,
        'description': 'TodoApp API errors are high'
    },
    'todoapp_api_latency': {
        'query': 'rate(latency[1m])',
        'threshold': 500,
        'description': 'TodoApp API latency is high'
    }
}

def query_prometheus(query: str) -> float:
    """Query Prometheus for a metric value"""
    try:
        response = requests.get(f'{PROMETHEUS_URL}/api/v1/query', params={'query': query})
        response.raise_for_status()
        result = response.json()['data']['result']
        if result:
            return float(result[0]['value'][1])
        else:
            return 0
    except requests.RequestException as e:
        logger.error(f'Error querying Prometheus: {e}')
        return 0

def send_telegram_notification(message: str) -> None:
    """Send a notification to Telegram"""
    try:
        response = requests.post(f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage', json={'chat_id': TELEGRAM_CHAT_ID, 'text': message})
        response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f'Error sending Telegram notification: {e}')

def send_pagerduty_notification(message: str) -> None:
    """Send a notification to PagerDuty"""
    try:
        response = requests.post(f'https://events.pagerduty.com/generic/2010-04-15/create_event.json', json={
            'service_key': PAGERDUTY_API_KEY,
            'incident_key': f'todoapp-{datetime.now().strftime("%Y%m%d%H%M%S")}',
            'event_type': 'trigger',
            'description': message
        })
        response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f'Error sending PagerDuty notification: {e}')

def check_alerts() -> None:
    """Check alert rules and send notifications"""
    for rule, config in ALERT_RULES.items():
        value = query_prometheus(config['query'])
        if value > config['threshold']:
            message = f'{config["description"]}: {value}'
            send_telegram_notification(message)
            send_pagerduty_notification(message)
            logger.info(message)

if __name__ == '__main__':
    check_alerts()