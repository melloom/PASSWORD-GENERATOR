#!/usr/bin/env python3
"""
Simple database setup script
"""

import os
import sqlite3
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Project paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / 'backend' / 'data'
DB_PATH = DATA_DIR / 'vault.db'
SCHEMA_PATH = BASE_DIR / 'backend' / 'db' / 'schema.sql'

def main():
    # Create data directory
    logger.info(f"Creating data directory at {DATA_DIR}")
    os.makedirs(DATA_DIR, exist_ok=True)

    # Create backup directory
    backup_dir = DATA_DIR / 'backups'
    os.makedirs(backup_dir, exist_ok=True)

    # Create logs directory
    logs_dir = BASE_DIR / 'backend' / 'logs'
    os.makedirs(logs_dir, exist_ok=True)

    # Check if schema file exists
    if not SCHEMA_PATH.exists():
        logger.error(f"Schema file not found at {SCHEMA_PATH}")
        return False

    # Read schema file
    with open(SCHEMA_PATH, 'r') as f:
        schema_script = f.read()

    # Initialize database
    try:
        logger.info(f"Creating database at {DB_PATH}")
        conn = sqlite3.connect(DB_PATH)

        # Execute schema script
        conn.executescript(schema_script)
        conn.commit()
        conn.close()

        logger.info("Database initialized successfully!")
        return True
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        return False

if __name__ == "__main__":
    main()