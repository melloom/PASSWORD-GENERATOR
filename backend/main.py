"""
Main entry point for the password vault backend
"""

import os
import sys
import signal
import argparse
import logging
from pathlib import Path

# Setup path to include the backend package
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.db.database import DatabaseManager
from backend.auth.authentication import AuthManager
from backend.api.routes import setup_api
from backend.utils.logging import setup_logging
from backend.utils.security import MemoryProtection


def signal_handler(sig, frame):
    """Handle interrupt signals gracefully"""
    print("\nShutting down vault securely...")
    # Clear sensitive data from memory
    MemoryProtection.secure_cleanup()
    sys.exit(0)


def create_directories():
    """Create necessary directories if they don't exist"""
    from backend.config import BASE_DIR

    # Create data directory
    data_dir = os.path.join(BASE_DIR, 'data')
    os.makedirs(data_dir, exist_ok=True)

    # Create backup directory
    backup_dir = os.path.join(data_dir, 'backups')
    os.makedirs(backup_dir, exist_ok=True)

    # Create logs directory
    logs_dir = os.path.join(BASE_DIR, 'logs')
    os.makedirs(logs_dir, exist_ok=True)


def main():
    """Main function to start the password vault backend"""
    parser = argparse.ArgumentParser(description='Military-Grade Password Vault')
    parser.add_argument('--init', action='store_true', help='Initialize the vault database')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    args = parser.parse_args()

    # Create required directories
    create_directories()

    # Set up logging
    log_level = logging.DEBUG if args.debug else logging.INFO
    setup_logging(log_level)
    logger = logging.getLogger(__name__)

    # Register signal handlers for clean shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Initialize memory protection
    MemoryProtection.init()

    # Initialize database
    db_manager = DatabaseManager()
    if args.init:
        logger.info("Initializing vault database...")
        db_manager.init_database()
        logger.info("Database initialized successfully.")
        return

    # Check if database exists
    if not db_manager.database_exists():
        logger.error("Database not found. Run with --init to create a new vault.")
        return

    # Start the API server
    logger.info("Starting Password Vault backend...")
    api_server = setup_api(db_manager)

    try:
        api_server.run(host="0.0.0.0", port=5001, debug=args.debug)
    except Exception as e:
        logger.error(f"Error running API server: {str(e)}")
    finally:
        # Ensure secure cleanup
        MemoryProtection.secure_cleanup()


if __name__ == "__main__":
    main()
