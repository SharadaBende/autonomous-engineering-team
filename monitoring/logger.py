import logging
import logging.config
import os
from pythonjsonlogger import jsonlogger

# Load logging configuration from environment variables
LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
LOG_FORMAT = os.environ.get('LOG_FORMAT', 'json')
LOG_OUTPUT = os.environ.get('LOG_OUTPUT', 'stdout')

# Define logging configuration
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': jsonlogger.JsonFormatter,
            'fmt': '%(asctime)s %(levelname)s %(name)s %(message)s'
        },
        'plain': {
            'format': '%(asctime)s %(levelname)s %(name)s %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': LOG_FORMAT
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'todoapp.log',
            'formatter': LOG_FORMAT
        }
    },
    'root': {
        'level': LOG_LEVEL,
        'handlers': [LOG_OUTPUT]
    }
}

# Configure logging
logging.config.dictConfig({
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': jsonlogger.JsonFormatter,
            'fmt': '%(asctime)s %(levelname)s %(name)s %(message)s'
        },
        'plain': {
            'format': '%(asctime)s %(levelname)s %(name)s %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': LOG_FORMAT
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'todoapp.log',
            'formatter': LOG_FORMAT
        }
    },
    'root': {
        'level': LOG_LEVEL,
        'handlers': ['console' if LOG_OUTPUT == 'stdout' else 'file']
    }
})

# Create a logger
logger = logging.getLogger(__name__)

def main():
    try:
        # Test logging
        logger.debug('Debug message')
        logger.info('Info message')
        logger.warning('Warning message')
        logger.error('Error message')
        logger.critical('Critical message')
    except Exception as e:
        logger.error(f'Error: {str(e)}')

if __name__ == '__main__':
    main()