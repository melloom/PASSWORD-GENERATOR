"""
Logging utilities for the password vault
"""

import os
import logging
from logging.handlers import RotatingFileHandler

from backend.config import LOGGING


def setup_logging(log_level=None):
    """
    Set up logging for the application

    Args:
        log_level (int, optional): The log level to use
    """
    # Create logs directory if it doesn't exist
    log_dir = os.path.dirname(LOGGING['file'])
    os.makedirs(log_dir, exist_ok=True)

    # Use provided log level or the one from config
    level = log_level if log_level is not None else LOGGING['level']

    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(level)

    # Remove any existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)

    # Create file handler
    file_handler = RotatingFileHandler(
        LOGGING['file'],
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=5
    )
    file_handler.setLevel(level)
    file_handler.setFormatter(logging.Formatter(LOGGING['format']))

    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.setFormatter(logging.Formatter(LOGGING['format']))

    # Add handlers to root logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    # Log startup message
    logger.info("Logging configured")